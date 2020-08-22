//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require('mongoose');
const _ = require('lodash');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
// database connection
// global mongodb connection string
mongoose.connect('mongodb+srv://admin-krunal:admin@cluster0.of2zn.mongodb.net/todoDB?retryWrites=true&w=majority' , {useNewUrlParser: true , useUnifiedTopology: true} );
// local connection string
// mongoose.connect('mongodb://localhost:27017/todoDB' , {useNewUrlParser: true , useUnifiedTopology: true} );


// creating schema
const itemSchema = mongoose.Schema({
  name: {
    type: String
  }
});

//creating collection / model
const Item = mongoose.model("Item" , itemSchema);

// creating 3 default documents
const item1 = new Item({
  name: "Welcome to the ToDo list."
});
const item2 = new Item({
  name: "Type a task in the input box"
});
const item3 = new Item({
  name: "Click on the plus icon (+)."
});

//default items that are to be inserted to the list 
const defaultItems = [item1, item2, item3];


//Default root route 
app.get("/", function(req, res) {
  Item.find({} , (err, data)=>{
    if(data.length === 0){
      Item.insertMany(defaultItems , (err)=>{
        if(err){
          console.log(err);
        }else{
        console.log("Default data added to list.");
        }
      });
      res.redirect("/");
    }else{
      res.render("list" , {listTitle: "Today", newListItems: data})
    }
  });
});


app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.listSubmit;
  const item = new Item({
    name: itemName
  });

  if(listName == "Today"){
    item.save();
    res.redirect('/');
  }else{
    List.findOne({name: listName} , (err ,data)=>{
      data.items.push(item);
      data.save();
      res.redirect("/" + listName);  
    });
  }
});

// deletes the item in list when user check mark any task
app.post("/delete" , (req, res)=>{
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId , (err)=>{
      if(!err){
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName } ,  {$pull: {items: {_id: checkedItemId}}} , (e, foundList)=>{
        if(!err){
          res.redirect("/" + listName);
        }  
     });  
  }
});

// creating List Schema 
const listSchema = mongoose.Schema({
  name: String,
  items: [itemSchema]
});

// creating list model
const List = mongoose.model("List" , listSchema);

//when the user is redirected to a custom subdirectory
app.get("/:customListName" , (req,res)=>{
const customListName = _.capitalize(req.params.customListName); 
List.findOne({name: customListName} , (err,foundList)=>{
  if(!err){
    if(!foundList){
      // Create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    }else{
      // show as existing list
      res.render("list" , { listTitle: foundList.name, newListItems: foundList.items});
    }
  }
});
});

let port = process.env.port
if(port === null || port === ""){
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started on port 3000");
});

