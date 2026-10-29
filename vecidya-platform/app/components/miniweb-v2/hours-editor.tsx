import { useState } from "react";
import {
  HOURS_V2_DAYS, newHoursV2, setHoursV2Day, validateHoursV2,
  type HoursV2Content, type HoursV2DayIndex,
} from "../../features/miniweb-v2/hours";

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

/** Editor V2 autónomo. No importa componentes ni estados de horario V1. */
export function HoursV2Editor({ initial, onSave }: {
  initial?: HoursV2Content;
  onSave: (value: HoursV2Content) => void;
}) {
  const [value, setValue] = useState<HoursV2Content>(() => initial ?? newHoursV2());
  const [attempted, setAttempted] = useState(false);
  const errors = validateHoursV2(value);
  return (
    <section aria-labelledby="hours-v2-title">
      <h2 id="hours-v2-title">Horario de atención</h2>
      <p>Configura desde cero los horarios que se mostrarán en tu nuevo sitio.</p>
      <label htmlFor="hours-v2-timezone">Zona horaria</label>
      <input id="hours-v2-timezone" value={value.timezone} placeholder="America/Bogota"
        onChange={(event) => setValue({ ...value, timezone: event.target.value })} />
      {HOURS_V2_DAYS.map((index: HoursV2DayIndex) => {
        const day = value.days.find((entry) => entry.day === index);
        if (!day) return null;
        return (
          <fieldset key={index}>
            <legend>{DAY_NAMES[index]}</legend>
            <label>
              <input type="checkbox" checked={!day.closed}
                onChange={(event) => setValue(setHoursV2Day(value, index, {
                  closed: !event.target.checked,
                  intervals: event.target.checked ? [{ start: "09:00", end: "17:00" }] : [],
                }))} />
              Abierto
            </label>
            {!day.closed && (
              <div>
                {day.intervals.map((interval, position) => (
                  <div key={position}>
                    <label>Desde
                      <input type="time" value={interval.start}
                        onChange={(event) => setValue(setHoursV2Day(value, index, {
                          closed: false,
                          intervals: day.intervals.map((item, i) => i === position ? { ...item, start: event.target.value } : item),
                        }))} />
                    </label>
                    <label>Hasta
                      <input type="time" value={interval.end}
                        onChange={(event) => setValue(setHoursV2Day(value, index, {
                          closed: false,
                          intervals: day.intervals.map((item, i) => i === position ? { ...item, end: event.target.value } : item),
                        }))} />
                    </label>
                    <button type="button" onClick={() => setValue(setHoursV2Day(value, index, {
                      closed: false, intervals: day.intervals.filter((_, i) => i !== position),
                    }))}>Eliminar intervalo</button>
                  </div>
                ))}
                <button type="button" onClick={() => setValue(setHoursV2Day(value, index, {
                  closed: false, intervals: [...day.intervals, { start: "09:00", end: "17:00" }],
                }))}>Añadir intervalo</button>
              </div>
            )}
          </fieldset>
        );
      })}
      <label htmlFor="hours-v2-notice">Nota pública opcional</label>
      <textarea id="hours-v2-notice" value={value.notice}
        onChange={(event) => setValue({ ...value, notice: event.target.value })} />
      {attempted && errors.length > 0 && <p role="alert">Revisa el horario: {errors.join(", ")}</p>}
      <button type="button" onClick={() => {
        setAttempted(true);
        if (!errors.length) onSave(value);
      }}>Guardar horario V2</button>
    </section>
  );
}
