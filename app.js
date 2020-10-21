const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(express.static("public"));

mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemScema = {
	name: {
		type: String,
		required: [true, "Add a correct item"]
	}
};
const Item = mongoose.model("Item", itemScema);

const item1 = new Item({
	name: "Welcome to your todolist"
});
const item2 = new Item({
	name: "Hit the + to add new items"
});
const item3 = new Item({
	name: "<-- Hit this to delete items"
});
const defaultItems = [item1, item2, item3];





app.get("/", function(req, res) {

	Item.find({}, function(err, items) {

		if (items.length === 0) {

			Item.insertMany(defaultItems, function(err) {
				if (err) {
					console.log(err);
				} else {
					console.log('Succesfully saved all the items');

				}
				res.redirect('/');
			});
		} else {
			res.render("list", {
				listTitle: "Today",
				newListItems: items
			});

		}

	});

});

app.post("/", function(req, res) {

	const item = req.body.newItem;

	if (req.body.list === "Work") {
		workItems.push(item);
		res.redirect("/work");
	} else {
		items.push(item);
		res.redirect("/");
	}
});

app.get("/work", function(req, res) {
	res.render("list", {
		listTitle: "Work List",
		newListItems: workItems
	});
});

app.get("/about", function(req, res) {
	res.render("about");
});

app.listen(3000, function() {
	console.log("Server started on port 3000");
});
