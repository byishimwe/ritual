interface Props {
  visible: boolean;
}

export function LoadingScreen({ visible }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0d0e10',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.6s ease',
        zIndex: 10,
      }}
    />
  );
}
