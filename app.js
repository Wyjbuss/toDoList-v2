const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(express.static("public"));

mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);

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

const listSchema = {
	name: String,
	items: [itemScema]
};
const List = mongoose.model("List", listSchema);




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

	const itemName = req.body.newItem;
	const listName = req.body.list;

	const item = new Item({
		name: itemName
	});

	if (listName === "Today") {
		item.save();
		res.redirect("/");
	} else {
		List.findOne({
			name: listName
		}, function(err, foundList) {
			foundList.items.push(item);
			foundList.save();
			res.redirect("/" + listName);
		});
	}

});

app.post("/delete", function(req, res) {
	const checkedItemId = req.body.deleteItem;
	const listName = req.body.listName;
	if (listName === "Today") {
		Item.findByIdAndRemove(checkedItemId, function(err) {
			res.redirect("/");
		});
	} else {
		List.findOneAndUpdate({
			name: listName
		}, {
			$pull: {
				items: {
					_id: checkedItemId
				}
			}
		}, function(err, results) {
			if (!err) {
				res.redirect("/" + listName);
			}
		});
	}


});


app.get("/:customRountName", function(req, res) {
	const customRountName = _.capitalize(req.params.customRountName);
	//console.log(req.params.customRountName);

	List.findOne({
		name: customRountName
	}, function(err, foundList) {
		if (!err) {
			if (!foundList) {
				console.log("Creating... -" + customRountName + "- list");
				list.save();
				res.redirect("/" + customRountName);
			} else {
				res.render("list", {
					listTitle: foundList.name,
					newListItems: foundList.items
				});
			}
		}
	});

	const list = new List({
		name: customRountName,
		items: defaultItems
	});


});

//deletes custome routs from mondodb
app.get("/:customRountName/delete", function(req, res) {
	const customRountName = (req.params.customRountName);
	//console.log(req.params.customRountName);

	List.deleteOne({
		name: customRountName
	}, function(err, foundList) {
		if (!err) {
			if (!foundList) {
				console.log("-" + customRountName + "- Not Found");
			} else {
				console.log("Deleted -" + customRountName + "- list");
				res.redirect("/")
			}
		}
	});
});

app.get("/about", function(req, res) {
	res.render("about");
});

app.listen(port, function() {
	console.log(`Server started on port ${port}`);
});
