import { useState } from "react";
import { initialsFor } from "../lib/people.js";

// Shows a profile photo when one exists, otherwise (or if it fails to load)
// falls back to the initials badge.
export default function Avatar({ src, name, initials, size, className = "" }) {
  const [failed, setFailed] = useState(false);
  const label = initials ?? initialsFor(name);
  const sizeClass = size ? `avatar-${size}` : "";
  const showImage = src && !failed;

  return (
    <span
      className={["avatar", sizeClass, showImage ? "has-photo" : "", className]
        .filter(Boolean)
        .join(" ")}
      aria-hidden={name ? undefined : true}
      title={name}
    >
      {showImage ? (
        <img
          src={src}
          alt={name ? `${name}'s profile picture` : ""}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        label
      )}
    </span>
  );
}
