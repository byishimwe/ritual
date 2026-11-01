/**
 * Fatal-failure recovery.
 *
 * The normal experience never shows interface chrome, but a permanently blank
 * canvas is worse than an honest message: this card exists only for a genuine
 * load or render failure and offers the one useful action (reload).
 */
export function FatalError({ detail }: { detail?: string }) {
  return (
    <div className="ritual-fatal">
      <div className="ritual-fatal__card">
        <h1>Ritual could not start</h1>
        <p>
          The 3D scene failed to load. This is usually a lost WebGL context or a missing model
          file.
        </p>
        {detail ? <pre>{detail}</pre> : null}
        <button type="button" onClick={() => window.location.reload()}>
          Reload the experience
        </button>
      </div>
    </div>
  );
}
