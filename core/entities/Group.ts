// Domain entity: Group
export interface Group {
  id: string
  name: string
  code: string
  members: Member[]
  createdAt: Date
}

export interface Member {
  id: string
  name: string
  joinedAt: Date
}
