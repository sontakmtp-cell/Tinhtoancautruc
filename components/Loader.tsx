import React from 'react';

const offsets = [-1, 0, 1];

const variants = [
  { '--fz': '0' },
  { '--fz': '1' },
  { '--rx': '1', '--fx': '-1' },
  { '--rx': '1', '--fx': '1' },
  { '--ry': '1', '--fy': '-1' },
  { '--ry': '1', '--fy': '1' },
] as const;

const cubeStyles = offsets.flatMap((x) =>
  offsets.flatMap((y) =>
    offsets.flatMap((z) =>
      variants.map(
        (variant) =>
          ({
            '--x': `${x}`,
            '--y': `${y}`,
            '--z': `${z}`,
            ...variant,
          } as React.CSSProperties)
      )
    )
  )
);

interface HamsterLoaderProps {
  message?: string;
}

export const HamsterLoader: React.FC<HamsterLoaderProps> = ({ message = "Đang thực hiện các phép tính phức tạp..." }) => (
  <>
    <style>{`
      @keyframes loader-hue-rotate {
        to {
          filter: hue-rotate(360deg);
        }
      }

      .loader-cube-container {
        --w: 35px;
        --g: 5px;
        --t: calc(var(--w) + var(--g));
        width: var(--w);
        aspect-ratio: 1;
        perspective: 120px;
        transform-style: preserve-3d;
        position: relative;
      }

      .loader-cube {
        --fz: 0;
        --rx: 0;
        --fx: 0;
        --ry: 0;
        --fy: 0;
        position: absolute;
        background: rgba(255, 255, 255, 0.85);
        border: 1px solid rgba(17, 24, 39, 0.65);
        width: var(--w);
        aspect-ratio: 1;
        bottom: calc(var(--w) * -0.5);
        right: calc(var(--w) * -0.5);
        animation: loader-rotate 20s linear infinite, loader-hue-rotate 20s linear infinite;
        transition: 5s;
        --a: translateZ(calc(0.5 * var(--w)))
          translateX(calc(var(--x) * var(--t) - 0.5 * var(--fy) * var(--w)))
          translateY(calc(var(--y) * var(--t) - 0.5 * var(--fx) * var(--w)))
          translateZ(
            calc(
              var(--z) * var(--t) - 0.5 * var(--ry) * var(--w) - 0.5 * var(--rx) *
                var(--w) - var(--fz) * var(--w)
            )
          )
          rotateX(calc(90deg * var(--rx))) rotateY(calc(90deg * var(--ry)));
        --p: translateX(calc(-0.5 * var(--w))) translateY(calc(-0.5 * var(--w)))
          translateZ(calc(-0.5 * var(--w)));
      }

      .loader-cube:hover {
        background: rgba(59, 130, 246, 0.2);
        border-color: rgba(37, 99, 235, 0.6);
        transition: 0s;
      }

      .dark .loader-cube {
        background: rgba(55, 65, 81, 0.75);
        border-color: rgba(209, 213, 219, 0.4);
      }

      .dark .loader-cube:hover {
        background: rgba(59, 130, 246, 0.3);
        border-color: rgba(191, 219, 254, 0.45);
      }

      @keyframes loader-rotate {
        0% {
          transform: var(--p) rotateZ(0deg) rotateY(0deg) rotateX(0deg) var(--a);
        }
        100% {
          transform: var(--p) rotateZ(360deg) rotateY(720deg) rotateX(360deg) var(--a);
        }
      }
    `}</style>
    <div aria-label="Đang tính toán..." role="status" className="flex items-center justify-center flex-col">
      <div className="loader-cube-container">
        {cubeStyles.map((style, index) => (
          <div key={index} className="loader-cube" style={style} />
        ))}
      </div>
      <p className="mt-32 text-sm font-medium text-gray-500 dark:text-gray-400">
        {message}
      </p>
    </div>
  </>
);
