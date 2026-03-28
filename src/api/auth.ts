import * as argon2 from "argon2";

export async function hashPassword(password: string): Promise<string> {
//Hash the password using the argon2.hash function.

try {
    const hash = await argon2.hash(password);
    return hash;
} catch (err) {
    throw new Error("Hashing error");
}

}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
//Use the argon2.verify function to compare the password in the HTTP request with the password that is stored in the database.
try {
    if (await argon2.verify(hash, password)) {
        return true;
    } else {
        return false;
    }
  } catch (err) {
    throw new Error("Hashing error");
  }
}