let app = require('./../../../../../app');
let request = require('supertest');
const db = require("./../../../../../src/models");
var http = require('http');


//jest.useFakeTimers(15000);


describe('User Profiling Test Cases', ()=>{
    beforeAll(async () => {
        try{
            await db.sequelize.sync();
            console.log('Connected to database successfully...');
        }
        catch(error){
            console.log('Unable to connect database...');
        }


        app.set('port', 8080);
        var server = http.createServer(app);
        server.listen(8080)
    })

    describe('Signup Testing', ()=>{
        test("Bad Request Test using wrong input", async()=> {
            await request(app)
            .post('/users/signup')
            .set('Content-Type', 'application/json')
            .set('Accept', '*/*')
            .send({
                    "username": "alihussainpid@gmail.com", // Using Wrong Format (it should be {"user":{"email":... , "password":...}})
                    "password": "sjk"
            }).then(async (res)=>{
                expect(res.statusCode).toBe(400);
            });
        });

        test("Already a registerd user is available", async ()=> {
            await request(app)
            .post('/users/signup')
            .set('Content-Type', 'application/json')
            .set('Accept', '*/*')
            .send({
                "user":{
                    "email": "alihussainpid@gmail.com",
                    "password": "sjk"
                }
            }).then(async (res)=>{
                expect(res.statusCode).toBe(409);
            });
        })
    })
})

