export interface User {
    id: number,
    user_name: {
        type : string,
        min: 1
    },
    first_name: {
        type : string,
        min: 1
    },
    family_name: {
        type : string,
        min: 1
    },
    is_active: boolean
}