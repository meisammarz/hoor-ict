type Shot = { id?: string | number; src: string; title: string; caption: string };

export function PhotoRail({ shots }: { shots: Shot[] }) {
  if (shots.length === 0) return null;
  const loop = shots.length > 1 ? [...shots, ...shots] : shots;
  return (
    <div className="photo-rail" dir="ltr">
      <div className="photo-track">
        {loop.map((shot, index) => (
          <figure key={`${shot.src}-${index}`} className="photo-card">
            <img src={shot.src} alt={shot.title} />
            <figcaption dir="rtl">
              <strong>{shot.title}</strong>
              <span>{shot.caption}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
