export class CustomErrorUserNotActive extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, CustomErrorUserNotActive.prototype);
        this.name = "CustomErrorUserNotActive";
    }
}