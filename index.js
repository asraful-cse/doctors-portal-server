const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const cors = require("cors");
const port = process.env.PORT || 5000;

// middleware..............

require("dotenv").config();
app.use(cors());
app.use(express.json()); // ---
// ----------------------------db user and pass---------------------
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v25nn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

async function run() {
	try {
		await client.connect();
		const database = client.db("doctors_portal");
		const appointmentsCollection = database.collection("appointments");
		const usersCollection = database.collection("users");
		console.log("connection database successfully");

		// app.get database theke ui er dashboard dekhanor jonno---- part(2)---
		app.get("/appointments", async (req, res) => {
			const email = req.query.email;
			// date ke new Date kora hoise eijonno niche same vabe cnvrt--
			const date = new Date(req.query.date).toLocaleDateString();
			// console.log(date);
			const query = { email: email, date: date };
			// console.log(query);
			const cursor = appointmentsCollection.find(query);
			const appointments = await cursor.toArray();
			res.json(appointments);
		});
		// app.post insert data------part(1)------
		app.post("/appointments", async (req, res) => {
			const appointment = req.body;
			const result = await appointmentsCollection.insertOne(appointment);
			console.log(result);
			res.json(result);
		});

		// create email user collection database rakhar jonno------------
		app.post("/users", async (req, res) => {
			const user = req.body;
			const result = await usersCollection.insertOne(user);
			console.log(result);
			res.json(result);
		});
		// google login user collection data rakhar jonno--------------
		app.put("/users", async (req, res) => {
			const user = req.body;
			const filter = { email: user.email };
			const options = { upsert: true };
			const updateDoc = { $set: user };
			const result = await usersCollection.updateOne(
				filter,
				updateDoc,
				options
			);
			res.json(result);
		});
		// admin korar jonno---------------------------
		app.put("/users/admin", async (req, res) => {
			const user = req.body;
			console.log("put", user.authorization);
			const filter = { email: user.email };
			const updateDoc = { $set: { role: "admin" } };
			const result = await usersCollection.updateOne(filter, updateDoc);
			res.json(result);
		});
		// admin ke pawar jonno----------------------------
		app.get("/users/:email", async (req, res) => {
			const email = req.params.email;
			const query = { email: email };
			const user = await usersCollection.findOne(query);
			let isAdmin = false;
			if (user.role === "admin") {
				isAdmin = true;
			}
			res.send({ admin: isAdmin });
		});
	} finally {
		// await client.close();
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send(
		"Doctors Portals--------------------------------------------------------------------------------connected "
	);
});

app.listen(port, () => {
	console.log("port connected", port);
});
