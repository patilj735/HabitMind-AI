import { useMemo } from "react";
import { format, parseISO } from "date-fns";

const levelColor = (count, max) => {
  if (!count) return "var(--heat-0)";

  const ratio = count / Math.max(1, max);

  if (ratio < 0.25) return "var(--heat-1)";
  if (ratio < 0.5) return "var(--heat-2)";
  if (ratio < 0.85) return "var(--heat-3)";

  return "var(--heat-4)";
};

export default function HeatmapChart({ data = [] }) {
  const { cols, max } = useMemo(() => {
    if (!data.length) {
      return {
        cols: [],
        max: 0,
      };
    }

    const max = Math.max(
      ...data.map((d) => Number(d.count) || 0)
    );

    const cols = [];
    let col = [];

    data.forEach((d, i) => {
      const date = parseISO(d.date);

      const shifted = (date.getDay() + 6) % 7;

      if (i === 0) {
        for (let j = 0; j < shifted; j++) {
          col.push(null);
        }
      }

      col.push(d);

      if (shifted === 6) {
        cols.push(col);
        col = [];
      }
    });

    if (col.length) {
      while (col.length < 7) {
        col.push(null);
      }

      cols.push(col);
    }

    return {
      cols,
      max,
    };
  }, [data]);

  const totalCount = data.reduce(
    (sum, d) => sum + (Number(d.count) || 0),
    0
  );

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-medium">
            Consistency
          </div>

          <div className="text-xs text-muted">
            {totalCount} completions in the last 90 days
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted">
          <span>Less</span>

          {[0, 0.2, 0.5, 0.8, 1].map((r, i) => (
            <span
              key={i}
              className="w-3 h-3 rounded-sm"
              style={{
                background: levelColor(
                  r * (max || 1),
                  max || 1
                ),
              }}
            />
          ))}

          <span>More</span>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted">
          No completion data available yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {cols.map((col, ci) => (
              <div
                key={ci}
                className="flex flex-col gap-1"
              >
                {col.map((d, ri) =>
                  d ? (
                    <div
                      key={ri}
                      className="w-3.5 h-3.5 rounded-sm transition-colors"
                      style={{
                        background: levelColor(
                          Number(d.count) || 0,
                          max
                        ),
                      }}
                      title={`${format(
                        parseISO(d.date),
                        "MMM d, yyyy"
                      )} — ${
                        d.count
                      } completion${
                        d.count === 1 ? "" : "s"
                      }`}
                    />
                  ) : (
                    <div
                      key={ri}
                      className="w-3.5 h-3.5"
                    />
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}