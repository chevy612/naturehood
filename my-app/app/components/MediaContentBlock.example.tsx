"use client";
// Example usage of MediaContentBlock component
import MediaContentBlock from "./MediaContentBlock";

export default function ExamplePage() {
  return (
    <div>
      {/* Example with Image */}
      <MediaContentBlock
        title="Athletes as Brands"
        subtitle="Bulid audience through storytelling"
        mediaType="image"
        mediaSrc="/image/example.webp"
        mediaAlt="Mission statement visual"
        description="We are committed to creating innovative solutions that empower athletes worldwide. Through storytelling and technology, we bring their journeys to life."
        buttonText="Learn More"
        buttonLink="/about"
      />

      {/* Example with Video */}
      <MediaContentBlock
        title="Meet Our Athletes"
        subtitle="Stories of Excellence"
        mediaType="video"
        mediaSrc="/video/athlete-story.mp4"
        mediaAlt="Athlete story video"
        description="Watch how our athletes transform challenges into opportunities, pushing boundaries every single day."
        buttonText="Explore"
        buttonLink="/team"
        onButtonClick={() => console.log("Button clicked!")}
      />
    </div>
  );
}
