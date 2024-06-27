import { Database } from "@/logic/database";

export type Student = {
    studentNumber: string;
    name: string;
}

export type Assignment = {
    studentNumber: string;
    assignmentId: string;
    done: boolean;
    notes: string;
    timestamp: number;
}

type StudentSchema = {
    students: Student[];
    assignments: Assignment[];
}

export type StudentDatabase = Database<StudentSchema>

const database: StudentDatabase = new Database({
    students: [],
    assignments: []
})
