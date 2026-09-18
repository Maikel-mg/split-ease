# Split-Ease

Gestor de gastos compartidos entre grupos de personas: quién pagó qué, quién debe a quién y cómo se saldan las cuentas.

## Language

### Personas y grupos

**Grupo**:
Conjunto de personas que comparten gastos y que liquidan las cuentas entre ellas.
_Avoid_: Cuenta, equipo, sala

**Miembro**:
Persona que pertenece a un grupo. Dentro de un grupo se identifica por su nombre.
_Avoid_: Usuario, integrante

**Grupo público**:
Grupo en el que todos los miembros ven todos los gastos. Es el modo habitual y el único en el que existe la validación.
_Avoid_: Grupo normal, grupo abierto

**Grupo sorpresa**:
Grupo en el que cada miembro solo ve los gastos en los que participa. Existe para dividir el coste de un regalo sin que quien lo recibe conozca su precio.
_Avoid_: Grupo privado, grupo oculto

### Dinero

**Gasto**:
Importe que un miembro adelanta y que se reparte entre uno o varios miembros.
_Avoid_: Compra, factura, movimiento

**Pagador**:
Miembro que adelantó el dinero de un gasto. No tiene por qué ser uno de sus participantes.
_Avoid_: Comprador, deudor

**Participante**:
Miembro que comparte el coste de un gasto.
_Avoid_: Implicado, deudor

**Reparto**:
Manera de dividir un gasto entre sus participantes: a partes iguales, por partes, o por importes concretos.
_Avoid_: División, prorrateo, split

**Saldo**:
Posición neta de un miembro dentro del grupo: positiva si le deben dinero, negativa si debe.
_Avoid_: Balance

**Deuda**:
Cantidad que un miembro concreto debe pagar a otro concreto.
_Avoid_: Crédito, acreencia

**Pago**:
Transferencia ya realizada de un miembro a otro, registrada en el grupo.
_Avoid_: Bizum, liquidación, transferencia

**Saldar**:
Registrar los pagos que resuelven las deudas pendientes de un grupo.
_Avoid_: Liquidar, cerrar cuentas

### Validación

**Validación**:
Acto por el que un miembro confirma que los gastos y pagos que le afectan son correctos y que acepta el reparto resultante. Cada miembro valida únicamente lo suyo y no puede validar en nombre de otro.
_Avoid_: Firma, visto bueno, OK, confirmación, aprobación

**Pendiente de validar**:
Miembro que todavía no ha validado.
_Avoid_: Sin firmar, no confirmado

**Retirar la validación**:
Deshacer la propia validación.
_Avoid_: Rechazar, revocar

**Validación completa**:
Estado del grupo en el que todos los miembros que participan en algún gasto han validado. Un miembro que no participa en ningún gasto queda excluido y no bloquea este estado.
_Avoid_: Todos firmaron

**Cambio invalidante**:
Modificación de un gasto que altera su importe, su pagador, sus participantes o su reparto. Retira la validación de todos los miembros del grupo.
_Avoid_: Edición, modificación

**Pago comprometido**:
Pago registrado mientras la validación estaba completa y que puede quedar descolgado si después se produce un cambio invalidante.
_Avoid_: Pago huérfano, pago afectado

### Ciclo de vida del grupo

**Archivar**:
Ocultar un grupo de la lista de grupos. No significa que sus cuentas estén cerradas ni que estén al día.
_Avoid_: Cerrar, finalizar, terminar
