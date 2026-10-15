-- Team tab (Tracking and Sharing): close the sharing RLS holes found in 009, move every
-- write on athlete_record_shares behind SECURITY DEFINER RPCs, and add per-side notes.
--
-- Terminology: Athlete = athlete_id (owns the records), Coach = viewer_id (reads them).
--
-- Holes closed:
--   1. "Viewers update their share status" allowed a viewer to update ANY column of their
--      own rows (re-point athlete_id, widen scope, force status).
--   2. "Viewers insert accepted link shares" accepted any athlete_id / scope without
--      validating the link.
--   3. "Authed users read active share links" let every signed-in user read every active
--      link token.
--   4. "Athletes manage their shares" (ALL) let the athlete write status = 'accepted'
--      (forced tracking without consent, spoofed "invite accepted" notification).
--
-- Mobile `develop` writes athlete_record_shares directly and reads athlete_share_links by
-- token; both stop working after this migration until the client switches to the RPCs.

-- ---------------------------------------------------------------------------
-- Notes: each side writes only its own column (via update_share_note)
-- ---------------------------------------------------------------------------

ALTER TABLE public.athlete_record_shares
  ADD COLUMN IF NOT EXISTS athlete_note text,
  ADD COLUMN IF NOT EXISTS viewer_note text;

ALTER TABLE public.athlete_record_shares
  DROP CONSTRAINT IF EXISTS athlete_record_shares_athlete_note_len;
ALTER TABLE public.athlete_record_shares
  ADD CONSTRAINT athlete_record_shares_athlete_note_len
  CHECK (athlete_note IS NULL OR char_length(athlete_note) <= 200);

ALTER TABLE public.athlete_record_shares
  DROP CONSTRAINT IF EXISTS athlete_record_shares_viewer_note_len;
ALTER TABLE public.athlete_record_shares
  ADD CONSTRAINT athlete_record_shares_viewer_note_len
  CHECK (viewer_note IS NULL OR char_length(viewer_note) <= 200);

-- Link tokens are the only secret protecting a share, so reject short client-chosen ones.
-- NOT VALID: new rows are checked, rows that already exist are not rescanned.
ALTER TABLE public.athlete_share_links
  DROP CONSTRAINT IF EXISTS athlete_share_links_token_len;
ALTER TABLE public.athlete_share_links
  ADD CONSTRAINT athlete_share_links_token_len
  CHECK (char_length(token) >= 24) NOT VALID;

-- ---------------------------------------------------------------------------
-- Policies: SELECT only for the two parties, no client writes on shares
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Athletes manage their shares" ON public.athlete_record_shares;
DROP POLICY IF EXISTS "Viewers update their share status" ON public.athlete_record_shares;
DROP POLICY IF EXISTS "Viewers insert accepted link shares" ON public.athlete_record_shares;

DROP POLICY IF EXISTS "Athletes read their shares" ON public.athlete_record_shares;
CREATE POLICY "Athletes read their shares"
  ON public.athlete_record_shares
  FOR SELECT
  USING (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "Viewers read their shares" ON public.athlete_record_shares;
CREATE POLICY "Viewers read their shares"
  ON public.athlete_record_shares
  FOR SELECT
  USING (auth.uid() = viewer_id);

-- Defense in depth: even a future permissive policy cannot re-open client writes.
REVOKE ALL ON public.athlete_record_shares FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.athlete_record_shares FROM authenticated;

-- Links: the Athlete keeps creating and managing their own rows directly. Nobody else can
-- read a link row any more; Coaches go through peek_share_link / redeem_share_link.
DROP POLICY IF EXISTS "Authed users read active share links" ON public.athlete_share_links;

DROP POLICY IF EXISTS "Athletes manage share links" ON public.athlete_share_links;
CREATE POLICY "Athletes manage share links"
  ON public.athlete_share_links
  FOR ALL
  USING (auth.uid() = athlete_id)
  WITH CHECK (auth.uid() = athlete_id);

REVOKE ALL ON public.athlete_share_links FROM anon;

-- Soft-deleted workouts must not leak to Coaches.
DROP POLICY IF EXISTS "Viewers read shared workouts" ON public.training_logs;
CREATE POLICY "Viewers read shared workouts"
  ON public.training_logs
  FOR SELECT
  USING (
    is_deleted = false
    AND EXISTS (
      SELECT 1
      FROM public.athlete_record_shares s
      WHERE s.athlete_id = training_logs.user_id
        AND s.viewer_id = auth.uid()
        AND s.status = 'accepted'
        AND s.share_workouts = true
    )
  );

-- ---------------------------------------------------------------------------
-- RPCs. Errors use a stable message plus an SQLSTATE; see team-rpc-contract.md.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.invite_viewer(
  p_viewer_id uuid,
  p_share_meals boolean,
  p_share_workouts boolean
)
RETURNS public.athlete_record_shares
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_me uuid := auth.uid();
  v_row public.athlete_record_shares;
BEGIN
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '42501';
  END IF;
  IF p_viewer_id IS NULL THEN
    RAISE EXCEPTION 'user_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF p_viewer_id = v_me THEN
    RAISE EXCEPTION 'cannot_share_with_self' USING ERRCODE = '22023';
  END IF;
  IF NOT (COALESCE(p_share_meals, false) OR COALESCE(p_share_workouts, false)) THEN
    RAISE EXCEPTION 'scope_required' USING ERRCODE = '22023';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_viewer_id) THEN
    RAISE EXCEPTION 'user_not_found' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.athlete_record_shares AS s
    (athlete_id, viewer_id, share_meals, share_workouts, status, invite_source)
  VALUES
    (v_me, p_viewer_id, COALESCE(p_share_meals, false), COALESCE(p_share_workouts, false),
     'pending', 'invite')
  ON CONFLICT (athlete_id, viewer_id) DO UPDATE SET
    share_meals = EXCLUDED.share_meals,
    share_workouts = EXCLUDED.share_workouts,
    status = CASE WHEN s.status = 'accepted' THEN 'accepted' ELSE 'pending' END,
    invite_source = CASE WHEN s.status = 'accepted' THEN s.invite_source ELSE 'invite' END,
    share_link_id = CASE WHEN s.status = 'accepted' THEN s.share_link_id ELSE NULL END,
    updated_at = now()
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.respond_to_share(
  p_share_id uuid,
  p_accept boolean
)
RETURNS public.athlete_record_shares
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_me uuid := auth.uid();
  v_row public.athlete_record_shares;
BEGIN
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '42501';
  END IF;
  IF p_accept IS NULL THEN
    RAISE EXCEPTION 'invalid_argument' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_row FROM public.athlete_record_shares
  WHERE id = p_share_id AND v_me IN (athlete_id, viewer_id)
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'share_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF v_row.viewer_id <> v_me THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  IF v_row.status <> 'pending' THEN
    RAISE EXCEPTION 'share_not_pending' USING ERRCODE = '55000';
  END IF;

  UPDATE public.athlete_record_shares
  SET status = CASE WHEN p_accept THEN 'accepted' ELSE 'revoked' END,
      updated_at = now()
  WHERE id = p_share_id
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_share_options(
  p_share_id uuid,
  p_share_meals boolean,
  p_share_workouts boolean
)
RETURNS public.athlete_record_shares
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_me uuid := auth.uid();
  v_row public.athlete_record_shares;
BEGIN
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_row FROM public.athlete_record_shares
  WHERE id = p_share_id AND v_me IN (athlete_id, viewer_id)
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'share_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF v_row.athlete_id <> v_me THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  IF v_row.status = 'revoked' THEN
    RAISE EXCEPTION 'share_ended' USING ERRCODE = '55000';
  END IF;
  IF NOT (COALESCE(p_share_meals, false) OR COALESCE(p_share_workouts, false)) THEN
    RAISE EXCEPTION 'scope_required' USING ERRCODE = '22023';
  END IF;

  UPDATE public.athlete_record_shares
  SET share_meals = COALESCE(p_share_meals, false),
      share_workouts = COALESCE(p_share_workouts, false),
      updated_at = now()
  WHERE id = p_share_id
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_share_note(
  p_share_id uuid,
  p_note text
)
RETURNS public.athlete_record_shares
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_me uuid := auth.uid();
  v_note text := NULLIF(btrim(COALESCE(p_note, '')), '');
  v_row public.athlete_record_shares;
BEGIN
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '42501';
  END IF;
  IF v_note IS NOT NULL AND char_length(v_note) > 200 THEN
    RAISE EXCEPTION 'note_too_long' USING ERRCODE = '22001';
  END IF;

  SELECT * INTO v_row FROM public.athlete_record_shares
  WHERE id = p_share_id AND v_me IN (athlete_id, viewer_id)
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'share_not_found' USING ERRCODE = 'P0002';
  END IF;

  IF v_row.athlete_id = v_me THEN
    UPDATE public.athlete_record_shares SET athlete_note = v_note
    WHERE id = p_share_id RETURNING * INTO v_row;
  ELSE
    UPDATE public.athlete_record_shares SET viewer_note = v_note
    WHERE id = p_share_id RETURNING * INTO v_row;
  END IF;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.end_share(p_share_id uuid)
RETURNS public.athlete_record_shares
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_me uuid := auth.uid();
  v_row public.athlete_record_shares;
BEGIN
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_row FROM public.athlete_record_shares
  WHERE id = p_share_id AND v_me IN (athlete_id, viewer_id)
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'share_not_found' USING ERRCODE = 'P0002';
  END IF;

  IF v_row.status <> 'revoked' THEN
    UPDATE public.athlete_record_shares
    SET status = 'revoked', updated_at = now()
    WHERE id = p_share_id
    RETURNING * INTO v_row;
  END IF;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.peek_share_link(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_me uuid := auth.uid();
  v_link public.athlete_share_links;
  v_athlete jsonb;
  v_existing text;
  v_reason text;
BEGIN
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_link FROM public.athlete_share_links WHERE token = p_token;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'not_found');
  END IF;

  SELECT jsonb_build_object(
           'id', p.id, 'username', p.username, 'name', p.name, 'avatar_url', p.avatar_url)
    INTO v_athlete
  FROM public.profiles p
  WHERE p.id = v_link.athlete_id;

  SELECT s.status INTO v_existing
  FROM public.athlete_record_shares s
  WHERE s.athlete_id = v_link.athlete_id AND s.viewer_id = v_me;

  IF v_link.athlete_id = v_me THEN
    v_reason := 'own_link';
  ELSIF NOT v_link.is_active THEN
    v_reason := 'inactive';
  ELSIF v_link.expires_at IS NOT NULL AND v_link.expires_at <= now() THEN
    v_reason := 'expired';
  END IF;

  IF v_reason IS NOT NULL AND v_reason <> 'own_link' THEN
    RETURN jsonb_build_object('valid', false, 'reason', v_reason);
  END IF;

  RETURN jsonb_build_object(
    'valid', v_reason IS NULL,
    'reason', v_reason,
    'athlete', v_athlete,
    'share_meals', v_link.share_meals,
    'share_workouts', v_link.share_workouts,
    'expires_at', v_link.expires_at,
    'existing_status', v_existing
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.redeem_share_link(p_token text)
RETURNS public.athlete_record_shares
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_me uuid := auth.uid();
  v_link public.athlete_share_links;
  v_row public.athlete_record_shares;
BEGIN
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_link FROM public.athlete_share_links WHERE token = p_token;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'link_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF v_link.athlete_id = v_me THEN
    RAISE EXCEPTION 'own_link' USING ERRCODE = '22023';
  END IF;
  IF NOT v_link.is_active THEN
    RAISE EXCEPTION 'link_inactive' USING ERRCODE = '55000';
  END IF;
  IF v_link.expires_at IS NOT NULL AND v_link.expires_at <= now() THEN
    RAISE EXCEPTION 'link_expired' USING ERRCODE = '55000';
  END IF;

  INSERT INTO public.athlete_record_shares AS s
    (athlete_id, viewer_id, share_meals, share_workouts, status, invite_source, share_link_id)
  VALUES
    (v_link.athlete_id, v_me, v_link.share_meals, v_link.share_workouts,
     'accepted', 'link', v_link.id)
  ON CONFLICT (athlete_id, viewer_id) DO UPDATE SET
    share_meals = CASE WHEN s.status = 'accepted'
                       THEN s.share_meals OR EXCLUDED.share_meals ELSE EXCLUDED.share_meals END,
    share_workouts = CASE WHEN s.status = 'accepted'
                          THEN s.share_workouts OR EXCLUDED.share_workouts ELSE EXCLUDED.share_workouts END,
    status = 'accepted',
    invite_source = CASE WHEN s.status = 'accepted' THEN s.invite_source ELSE 'link' END,
    share_link_id = CASE WHEN s.status = 'accepted' THEN s.share_link_id ELSE EXCLUDED.share_link_id END,
    updated_at = now()
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_my_shares(
  p_role text,
  p_include_revoked boolean DEFAULT false
)
RETURNS TABLE (
  share_id uuid,
  athlete_id uuid,
  viewer_id uuid,
  share_meals boolean,
  share_workouts boolean,
  status text,
  invite_source text,
  athlete_note text,
  viewer_note text,
  my_note text,
  peer_id uuid,
  peer_username text,
  peer_name text,
  peer_avatar_url text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
#variable_conflict use_column
DECLARE
  v_me uuid := auth.uid();
BEGIN
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '42501';
  END IF;
  IF p_role IS NULL OR p_role NOT IN ('athlete', 'coach') THEN
    RAISE EXCEPTION 'invalid_role' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  SELECT
    s.id,
    s.athlete_id,
    s.viewer_id,
    s.share_meals,
    s.share_workouts,
    s.status,
    s.invite_source,
    s.athlete_note,
    s.viewer_note,
    CASE WHEN p_role = 'athlete' THEN s.athlete_note ELSE s.viewer_note END,
    peer.id,
    peer.username::text,
    peer.name::text,
    peer.avatar_url::text,
    s.created_at,
    s.updated_at
  FROM public.athlete_record_shares s
  JOIN public.profiles peer
    ON peer.id = CASE WHEN p_role = 'athlete' THEN s.viewer_id ELSE s.athlete_id END
  WHERE (CASE WHEN p_role = 'athlete' THEN s.athlete_id ELSE s.viewer_id END) = v_me
    AND (COALESCE(p_include_revoked, false) OR s.status <> 'revoked')
  ORDER BY (s.status = 'pending') DESC, s.updated_at DESC, s.id;
END;
$$;

-- ---------------------------------------------------------------------------
-- Grants: signed-in users only (Supabase grants EXECUTE to anon by default).
-- ---------------------------------------------------------------------------

REVOKE ALL ON FUNCTION public.invite_viewer(uuid, boolean, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.respond_to_share(uuid, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_share_options(uuid, boolean, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_share_note(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.end_share(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.peek_share_link(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.redeem_share_link(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.list_my_shares(text, boolean) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.invite_viewer(uuid, boolean, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_to_share(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_share_options(uuid, boolean, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_share_note(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.end_share(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.peek_share_link(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_share_link(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_my_shares(text, boolean) TO authenticated;

NOTIFY pgrst, 'reload schema';
