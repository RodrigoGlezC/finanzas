import { describe, it, expect } from "vitest"
import { buildPlan, type Grid } from "./importXlsxParse"

// Grids REALES de "GASTOS SEMANALES.xlsx" (SheetJS header:1). Congeladas para que el test
// no dependa del archivo en disco. Hoja1 = control semanal; Hoja2 = calendario de pagos.
const GRIDS = [[["Agosto",null,"CONTROL DE GASTOS SEMANAL ",null,null,null,"CONTROL DE GASTOS SEMANAL ",null,null,null,"CONTROL DE GASTOS SEMANAL ",null,null,null,"CONTROL DE GASTOS SEMANAL ",null,null],[null,null,"DEL 17 AL 21",null,null,null,"DEL 24 AL 30",null,null,null,"DEL 31 AL 06",null,null,null,"DEL 10 AL 14",null,null],[null,null,"CATEGORIA","TIPO","$",null,"CATEGORIA","TIPO","$",null,"CATEGORIA","TIPO","$",null,"CATEGORIA","TIPO","$"],[null,null,"Despensa","Necesidades Basicas",600,null,"Despensa","Necesidades Basicas",600,null,"Despensa","Necesidades Basicas",600,null,"Despensa","Necesidades Basicas",600],[null,null,"Lavanderia","Necesidades Basicas",75,null,"Lavanderia","Necesidades Basicas",75,null,"Lavanderia","Necesidades Basicas",75,null,"Lavanderia","Necesidades Basicas",75],[null,null,"Transporte","Necesidades Basicas",250,null,"Transporte","Necesidades Basicas",250,null,"Transporte","Necesidades Basicas",250,null,"Transporte","Necesidades Basicas",250],[null,null,"Renta","Necesidades Basicas",875,null,"Renta","Necesidades Basicas",875,null,"Renta","Necesidades Basicas",875,null,"Renta","Necesidades Basicas",875],[null,null,"Recargas","Personal",50,null,"Recargas","Personal",50,null,"Recargas","Personal",50,null,"Recargas","Personal",50],[null,null,"Icloud","Suscripciones",4.25,null,"Icloud","Suscripciones",4.25,null,"Icloud","Suscripciones",4.25,null,"Icloud","Suscripciones",4.25],[null,null,"Spotify","Suscripciones",23.65,null,"Spotify","Suscripciones",23.65,null,"Spotify","Suscripciones",23.65,null,"Spotify","Suscripciones",23.65],[null,null,"Celular","Suscripciones",181.65,null,"Celular","Personal",181.65,null,"Celular","Personal",181.65,null,"Celular","Personal",181.65],[null,null,"Ahorro","Ahorros",150,null,"Ahorro","Ahorros",150,null,"Ahorro","Ahorros",150,null,"Ahorro","Ahorros",150],[null,null,"Ahorro Personal","Ahorros",200,null,"Ahorro Personal","Ahorros",200,null,"Ahorro Personal","Ahorros",200,null,"Ahorro Personal","Ahorros",200],[null,null,"Compras Personales","Personal",200,null,"Compras Personales","Personal",200,null,"Compras Personales","Personal",200,null,"Compras Personales","Personal",200],[null,null,"TOTAL",null,2609.55,null,"TOTAL",null,2609.55,null,"TOTAL",null,2609.55,null,"TOTAL",null,2609.55],[null,null,"SUELDO",null,3021.7,null,"SUELDO",null,2574.51,null,"SUELDO",null,2805.48,null,"SUELDO",null,3021.7],[null,null,"INGRESOS EXTRA",null,null,null,"INGRESOS EXTRA",null,null,null,"INGRESOS EXTRA",null,null,null,"INGRESOS EXTRA",null,null],[null,null,"SOBRANTE",null,412.15,null,"SOBRANTE",null,-35.04,null,"SOBRANTE",null,195.93,null,"SOBRANTE",null,412.15]],[["CATEGORIA","DIA DE PAGO",null,null,"SEMANA 1","SEMANA 2","SEMAN 3","SEMANA 4","TOTAL A PAGAR",null,null,null],[null,null,null,null,"DEL 03 AL 07","DEL 10 AL 14","DEL 17 AL 21","DEL 24 AL 28",null,null,null,"SIMBOLOGÍA"],["Spotify",1,null,null,23.65,23.65,23.65,23.65,94.6,null,null,"GUARDADO"],[null,null,null,null,null,null,null,null,null,null,null,"NO GUARDADO"],["CATEGORIA","DIA DE PAGO","SEMANA 1","SEMANA 2","SEMAN 3","SEMANA 4","TOTAL A PAGAR",null,null,null,null,null],[null,null,"DEL 20 AL 24","DEL 27 AL 31","DEL 03 AL 07","DEL 10 AL 14",null,null,null,null,null,null],["Renta",15,875,875,875,875,3500,null,null,null,null,null],["CATEGORIA","DIA DE PAGO","SEMANA 1","SEMANA 2","SEMAN 3","SEMANA 4","TOTAL A PAGAR",null,null,null,null,null],[null,null,"DEL 20 AL 24","DEL 27 AL 31","DEL 03 AL 07","DEL 10 AL 14",null,null,null,null,null,null],["Recargas",15,50,50,50,50,200,null,null,null,null,null],["CATEGORIA","DIA DE PAGO",null,"SEMANA 1","SEMANA 2","SEMAN 3","SEMANA 4","TOTAL A PAGAR",null,null,null,null],[null,null,null,"DEL 27 AL 31","DEL 03 AL 07","DEL 10 AL 14","DEL 17 AL 21",null,null,null,null,null],["Icloud",25,null,4.25,4.25,4.25,4.25,17,null,null,null,null],["CATEGORIA","DIA DE PAGO",null,"SEMANA 1","SEMANA 2","SEMAN 3","SEMANA 4","TOTAL A PAGAR",null,null,null,null],[null,null,null,"DEL 27 AL 31","DEL 03 AL 07","DEL 10 AL 14","DEL 17 AL 21",null,null,null,null,null],["Claude",26,null,87.5,87.5,87.5,87.5,350,null,null,null,null]]] as unknown as Grid[]

describe("buildPlan (import GASTOS SEMANALES)", () => {
  const plan = buildPlan(GRIDS)
  const rec = (cat: string) => plan.recs.find((r) => r.category === cat)

  it("pagos con dia (Hoja2) -> recurrentes mensuales con su dia y monto mensual", () => {
    expect(rec("Renta")).toMatchObject({ freq: "mensual", day: 15, amount: 3500, type: "out" })
    expect(rec("Spotify")).toMatchObject({ freq: "mensual", day: 1, amount: 94.6 })
    expect(rec("iCloud")).toMatchObject({ freq: "mensual", day: 25, amount: 17 })
    expect(rec("Claude")).toMatchObject({ freq: "mensual", day: 26, amount: 350 })
    expect(rec("Recargas")).toMatchObject({ freq: "mensual", day: 15, amount: 200 })
  })

  it("gastos semanales (Hoja1) que NO estan en el calendario -> semanales, sin doble conteo", () => {
    expect(rec("Despensa")).toMatchObject({ freq: "semanal", amount: 600, type: "out" })
    expect(rec("Celular")).toMatchObject({ freq: "semanal", amount: 181.65 })
    // Renta/Spotify/iCloud/Recargas ya salieron como mensuales: no deben duplicarse como semanales
    expect(plan.recs.filter((r) => r.category === "Renta")).toHaveLength(1)
    expect(plan.recs.filter((r) => r.category === "Spotify")).toHaveLength(1)
    expect(rec("Renta")!.freq).toBe("mensual")
  })

  it("SUELDO -> ingreso semanal (valor mas frecuente) y marca que varia", () => {
    expect(rec("Sueldo")).toMatchObject({ type: "in", freq: "semanal", amount: 3021.7 })
    expect(plan.incomeVaries).toBe(true)
  })

  it("normaliza acentos/capitalizacion al nombre oficial de la app", () => {
    const names = plan.cats.map((c) => c.name)
    expect(names).toContain("iCloud")     // "Icloud" -> "iCloud"
    expect(names).toContain("Lavandería") // "Lavanderia" -> "Lavandería"
    expect(plan.cats.find((c) => c.name === "Despensa")?.group).toBe("Necesidades Básicas")
  })

  it("totales esperados", () => {
    expect(plan.recs.filter((r) => r.freq === "mensual").length).toBe(5)
    expect(plan.recs.filter((r) => r.freq === "semanal" && r.type === "out").length).toBe(7)
    expect(plan.recs.filter((r) => r.type === "in").length).toBe(1)
  })
})
