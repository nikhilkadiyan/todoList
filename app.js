//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://nikhilkadiyan:test123@cluster0.hbdkvfp.mongodb.net/todolistDB');

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1= new Item({
  name: "Welcome to your todoList."
});

const item2= new Item({
  name: "Hit + button to add a new item."
});

const item3= new Item({
  name: "<-- Hit this to delete an item."
});

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List=mongoose.model("List",listSchema);

//Item.insertMany([item1,item2,item3]).then(()=> console.log("Saved 3 items"));

app.get("/", function(req, res) {

  Item.find().then((items)=>{
    if(items.length === 0){
      Item.insertMany([item1,item2,item3]).then(()=> console.log("Saved 3 items"));
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  })

});

app.get(("/:customListName"),function(req,res){
  const customListName= _.capitalize(req.params.customListName);
  List.findOne({name: customListName}).then((data)=> {
    if(data === null){
      //create new List
      const list = new List({
        name: customListName,
        items: [item1,item2,item3]
      });
    
      list.save();
      res.redirect("/"+customListName);
    }else{
      //show an existing List
      res.render("list",{listTitle: customListName, newListItems: data.items});
    }
  });
  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({name: itemName});
  if(listName == "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}).then((foundList)=>{
      if(foundList !== null){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      }
    })
  }
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId).then(()=>
    console.log("Successfully deleted checked item"));
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}).then((data)=>{
      if(data !== null){
        res.redirect("/"+listName);
      }
    });
  }
  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
