var userModel = require('../models/UserModel');

async function setup() {
    await userModel.removeUserByUsername("Test1")
}

setup()

/*
    Testing the getUserByUsername() function
*/

test('get a valid user', async function(){
    var result = await userModel.getUserByUsername('Bhuitt1');
    expect(typeof result).toBe("object");
})

test('get an invalid user', async function(){
    var result = await userModel.getUserByUsername('Bhuitt123');
    expect(typeof result).toBe("undefined");
})

/*
    Testing the addUser() function
*/

test('add a user', async function(){
    var testUser = userModel.user({userID: 1000, userName: "Test1", password: "testPassword", userFirstName: "FName", userLastName: "LName", portfolioID: 1000})
    var result = await userModel.addUser(testUser)
    var addedUser = await userModel.getUserByUsername('Test1');
    expect(addedUser.userFirstName).toBe("FName");
})

test('add a user that already exists', async function(){
    var testUser = userModel.user({userID: 1000, userName: "Test1", password: "testPassword", userFirstName: "FName", userLastName: "LName", portfolioID: 1000})
    var result = await userModel.addUser(testUser)
    expect(result).toBe("user already exists");
})

/*
    Testing the getNewUserID() function
*/

test('get the next available id', async function(){
    var result = await userModel.getNewUserID()
    expect(result).toBe(1001);
})

/*
    Testing the removeUserByUsername() function
*/

test('remove a portfolio that does not exist', async function(){
    var result = await userModel.removeUserByUsername("Doesnotexist1")
    expect(result.deletedCount).toBe(0);
})

test('remove a portfolio that does exist', async function(){
    var result = await userModel.removeUserByUsername("Test1")
    expect(result.deletedCount).toBe(1);
})