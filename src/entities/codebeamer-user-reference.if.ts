import { CodeBeamerReference } from "./codebeamer-reference.if";

/**
 * Structure of a reference a cb Item can have to a user
 */
export interface CodeBeamerUserReference extends CodeBeamerReference {
    email: string;
}