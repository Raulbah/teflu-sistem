export type Turno = 'DIA' | 'TARDE' | 'NOCHE';

export function getTurnoActual(): { turno: Turno; fechaTurno: Date } {
    const now = new Date();
    const hours = now.getHours();

    let turno: Turno = 'NOCHE'; // sí cambia → let

    const fechaTurno = new Date(now); // 👈 const
    fechaTurno.setHours(0, 0, 0, 0);

    if (hours >= 6 && hours < 14) {
        turno = 'DIA';
    } else if (hours >= 14 && hours < 22) {
        turno = 'TARDE';
    } else {
        turno = 'NOCHE';
        if (hours < 6) {
        fechaTurno.setDate(fechaTurno.getDate() - 1);
        }
    }

    return { turno, fechaTurno };
}
