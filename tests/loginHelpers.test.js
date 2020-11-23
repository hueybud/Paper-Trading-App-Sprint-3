var loginHelpers = require('../helpers/loginHelpers');
var userModel = require('../models/UserModel');

/*
    Testing the checkSignin() function
*/

test('attempting to sign in a user with no capital letter in their username', async function(){
    var req = {
        body: {
            userName: "brian1",
            password: "12345678"
        }
    }
    var result = await loginHelpers.checkSignin(req);
    expect(result).toBe("Username does not contain 1 uppercase letter and 1 number");
})

test('attempting to sign in a user with no number in their username', async function(){
    var req = {
        body: {
            userName: "Brian",
            password: "12345678"
        }
    }
    var result = await loginHelpers.checkSignin(req);
    expect(result).toBe("Username does not contain 1 uppercase letter and 1 number");
})

test('attempting to sign in a user with a number and capital letter in their username but a pasword that is less than 8 characters', async function(){
    var req = {
        body: {
            userName: "Brian123",
            password: "1234567"
        }
    }
    var result = await loginHelpers.checkSignin(req);
    expect(result).toBe("Password must be at least 8 characters long");
})

test('attempting to sign in a non registered user with a number and capital letter in their username and a pasword that is at least 8 characters long', async function(){
    var req = {
        body: {
            userName: "Brian123",
            password: "12345678"
        }
    }
    var result = await loginHelpers.checkSignin(req);
    expect(result).toBe("User does not exist");
})

test('attempting to sign in a registered user with their username but a password that does not match their password on file', async function(){
    var req = {
        body: {
            userName: "Bhuitt1",
            password: "123456789"
        }
    }
    var result = await loginHelpers.checkSignin(req);
    expect(result).toBe("Incorrect Password");
})

test('attempting to sign in a registered user with their username and correct password', async function(){
    var req = {
        body: {
            userName: "Bhuitt1",
            password: "12345678"
        },
        session: {
            theUser: {}
        }
    }
    var result = await loginHelpers.checkSignin(req);
    expect(result[0]).toBe("logged in");
    expect(typeof result[1]).toBe("object");
    expect(req.session.theUser.userName).toBe("Bhuitt1");
})

/*
    Testing the checkRegister() function
*/

async function setupTest() {
    await userModel.removeUserByUsername("Aanderson1");
}

setupTest();

test('attempting to register a user with a non-alphabetic first name', async function(){
    var req = {
        body: {
            userFirstName: "Alex18",
            userLastName: "Anderson",
            userName: "aanderson1",
            password: "12345678",
            confirmPassword: "12345"
        }
    }
    var result = await loginHelpers.checkRegister(req);
    expect(result).toBe("First name is not valid");
})

test('attempting to register a user with a non-alphabetic last name', async function(){
    var req = {
        body: {
            userFirstName: "Alex",
            userLastName: "Anderson18",
            userName: "aanderson1",
            password: "12345678",
            confirmPassword: "12345"
        }
    }
    var result = await loginHelpers.checkRegister(req);
    expect(result).toBe("Last name is not valid");
})

test('attempting to register a username that is already registered', async function(){
    var req = {
        body: {
            userFirstName: "Alex",
            userLastName: "Anderson",
            userName: "Bhuitt1",
            password: "12345678",
            confirmPassword: "12345"
        }
    }
    var result = await loginHelpers.checkRegister(req);
    expect(result).toBe("User already exists");
})


test('attempting to register a user with no capital letter in their username', async function(){
    var req = {
        body: {
            userFirstName: "Alex",
            userLastName: "Anderson",
            userName: "aanderson1",
            password: "12345678",
            confirmPassword: "12345"
        }
    }
    var result = await loginHelpers.checkRegister(req);
    expect(result).toBe("Username does not contain 1 uppercase letter and 1 number");
})

test('attempting to register a user with no number letter in their username', async function(){
    var req = {
        body: {
            userFirstName: "Alex",
            userLastName: "Anderson",
            userName: "Aanderson",
            password: "12345678",
            confirmPassword: "12345"
        }
    }
    var result = await loginHelpers.checkRegister(req);
    expect(result).toBe("Username does not contain 1 uppercase letter and 1 number");
})

test('attempting to register a user with a password that is not at least 8 characters', async function(){
    var req = {
        body: {
            userFirstName: "Alex",
            userLastName: "Anderson",
            userName: "Aanderson1",
            password: "123456",
            confirmPassword: "12345"
        }
    }
    var result = await loginHelpers.checkRegister(req);
    expect(result).toBe("Passwords must be at least 8 characters long");
})

test('attempting to register a user with a confirmation password that is not at least 8 characters', async function(){
    var req = {
        body: {
            userFirstName: "Alex",
            userLastName: "Anderson",
            userName: "Aanderson1",
            password: "12345678",
            confirmPassword: "12345"
        }
    }
    var result = await loginHelpers.checkRegister(req);
    expect(result).toBe("Passwords must be at least 8 characters long");
})

test('attempting to register a user with a password and confirmation password that are not the same', async function(){
    var req = {
        body: {
            userFirstName: "Alex",
            userLastName: "Anderson",
            userName: "Aanderson1",
            password: "12345678",
            confirmPassword: "123456789"
        }
    }
    var result = await loginHelpers.checkRegister(req);
    expect(result).toBe("Passwords must match");
})

test('attempting to register a user with a password and confirmation password that are not the same', async function(){
    var req = {
        body: {
            userFirstName: "Alex",
            userLastName: "Anderson",
            userName: "Aanderson1",
            password: "12345678",
            confirmPassword: "12345678"
        },
        session: {
            theUser: {}
        }
    }
    var result = await loginHelpers.checkRegister(req);
    expect(result).toBe("user added");
    expect(req.session.theUser.userName).toBe("Aanderson1");
})

