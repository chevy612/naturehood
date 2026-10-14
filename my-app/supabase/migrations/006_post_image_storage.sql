-- post_images is the bucket mobile uses for thread photos, but dev had no
-- storage policies, so authenticated clients could not upload. Own-folder
-- writes match food_images. The bucket is public, and a select policy lets
-- authenticated clients read objects they did not upload.

DROP POLICY IF EXISTS "users upload own post images" ON storage.objects;
CREATE POLICY "users upload own post images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'post_images'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "public read post images" ON storage.objects;
CREATE POLICY "public read post images"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'post_images');
