
export enum Type {
    Dir,
    Json
}

export class DiskItem {
    id: string
    title: string
    type: Type

    constructor(id: string, title: string, type: Type) {
        this.id = id
        this.title = title
        this.type = type
    }
}
