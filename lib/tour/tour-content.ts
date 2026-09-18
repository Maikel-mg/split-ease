import type { TourStep } from "@/lib/tour/tour-types"

/** First-run tour on the welcome screen: create or join a group. */
export const WELCOME_TOUR: TourStep[] = [
  {
    title: "¡Bienvenido a GastoGrupal!",
    description:
      "En 20 segundos te enseño cómo empezar. Puedes saltarte el tour cuando quieras y repetirlo más tarde.",
  },
  {
    target: '[data-tour="create-group"]',
    title: "Crear un grupo",
    description:
      "Elige esta opción si el grupo empieza contigo. Ponle un nombre y comparte el código con los demás.",
  },
  {
    target: '[data-tour="join-group"]',
    title: "Unirte a un grupo",
    description:
      "Si alguien ya creó el grupo, toca aquí y escribe el código que te hayan pasado.",
  },
]

const GROUP_MENU_STEP: TourStep = {
  target: '[data-tour="group-menu"]',
  title: "Menú del grupo",
  description:
    "Desde aquí compartes el grupo, añades personas y cambias los ajustes. También puedes volver a ver este tour cuando quieras.",
}

const GROUP_INFO_STEP: TourStep = {
  target: '[data-tour="group-info"]',
  title: "Tu grupo",
  description:
    "Este es el nombre del grupo. Todos los que participan ven exactamente lo mismo que tú.",
}

const ADD_EXPENSE_STEP: TourStep = {
  target: '[data-tour="add-expense"]',
  title: "Añadir un gasto",
  description:
    "Toca aquí cada vez que alguien pague algo: indicas quién pagó, cuánto y entre quiénes se reparte.",
}

const BALANCES_STEP: TourStep = {
  target: '[data-tour="tab-balances"]',
  title: "Saldos",
  description:
    "La app calcula sola quién debe a quién. No tienes que hacer ninguna cuenta.",
}

const EXPENSES_STEP: TourStep = {
  target: '[data-tour="tab-expenses"]',
  title: "Gastos",
  description:
    "El historial completo del grupo: qué se pagó, quién lo pagó y cuándo.",
}

const SETTLEMENT_STEP: TourStep = {
  target: '[data-tour="tab-settlement"]',
  title: "Saldar",
  description:
    "Cuando alguien pague de verdad, márcalo aquí para dejar el saldo a cero.",
}

const STATUS_STEP: TourStep = {
  target: '[data-tour="tab-status"]',
  title: "Mi estado",
  description:
    "Lo primero que ves cuando te toca: revisa los gastos que te afectan y confírmalos.",
}

const VALIDATION_STEP: TourStep = {
  target: '[data-tour="tab-validation"]',
  title: "Validación",
  description:
    "El grupo confirma los gastos entre todos. Cuando todos están de acuerdo, el grupo se cierra.",
  action: {
    label: "Ver la validación en detalle",
    tourId: "validation",
  },
}

/**
 * Tour of the group screen. Public groups have the validation flow, so they get
 * two extra steps ("Mi estado" and "Validación").
 */
export function getGroupTour(isPrivate: boolean): TourStep[] {
  const steps: TourStep[] = [
    GROUP_MENU_STEP,
    GROUP_INFO_STEP,
    ADD_EXPENSE_STEP,
  ]

  if (!isPrivate) {
    steps.push(STATUS_STEP)
  }

  steps.push(BALANCES_STEP, EXPENSES_STEP)

  if (!isPrivate) {
    steps.push(VALIDATION_STEP)
  }

  steps.push(SETTLEMENT_STEP)
  return steps
}

/**
 * Focused tour for the validation flow, which is the newest and least
 * understood feature. It can be launched on demand from the payments banner or
 * from the "Validación" step of the group tour, so it never auto-starts.
 */
export const VALIDATION_TOUR: TourStep[] = [
  {
    title: "¿Qué es validar?",
    description:
      "Antes de pagar, cada persona del grupo confirma que sus gastos y pagos son correctos. Te lo enseño en cuatro pasos.",
  },
  {
    target: '[data-tour="validation-progress"]',
    title: "Progreso de validación",
    description:
      "Arriba ves cuántas personas ya han validado. Cuando está completo, el grupo puede pagar con tranquilidad.",
  },
  {
    target: '[data-tour="payments-banner"]',
    title: "Aviso de pagos pendientes",
    description:
      "Si ya hay pagos registrados y falta gente por validar, aparece este aviso: un cambio de última hora obligaría a rehacer los Bizum ya enviados.",
  },
  {
    target: '[data-tour="tab-status"]',
    title: "Mi estado",
    description:
      "Aquí revisas tu saldo y confirmas que tus gastos y pagos cuadran. Es lo primero que ves si te toca validar.",
  },
  {
    target: '[data-tour="validate-action"]',
    title: "Confirmar mis gastos y pagos",
    description:
      "Toca este botón cuando lo hayas revisado. Si algo cambia después, puedes retirar la validación y volver a revisarlo.",
  },
  {
    target: '[data-tour="tab-validation"]',
    title: "Validación del grupo",
    description:
      "En esta pestaña ves quién ha validado y quién falta, para saber si el grupo puede pagar ya.",
  },
]

