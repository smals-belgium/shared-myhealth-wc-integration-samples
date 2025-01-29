
export class Prescription {
  id:number
  name:string
  description:string
  counter?:number

  constructor(id:number, name:string, description:string){
    this.id = id
    this.name = name
    this.description = description
    this.counter = undefined
  }

  static createFrom(p:Prescription): Prescription {
    const prescription = new Prescription(p.id, p.name, p.description)
    prescription.counter = p.counter
    return prescription
  }
}
