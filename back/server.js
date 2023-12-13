import express from 'express';
import methodOverride from 'method-override';
import mongoose from 'mongoose';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import 'dotenv/config'
const app = express();
const port = 3000;

app.use(express.urlencoded());
app.use(express.json());
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
console.log(process.env.SECRET);
app.use(session({
    secret: 'ssssssss',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

app.use(passport.initialize());
app.use(passport.session())

const uri = "mongodb+srv://amir:amiraliaslani@todo.t9u0fy7.mongodb.net/"

mongoose
.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=> console.log("connected to database"))
.catch(err => console.log("Could not connect to database", err));

passport.use(new LocalStrategy(
  async(username, password, done) =>{
    const user = await User.findOne({ username: username })
    console.log(user);
    if(!user || !bcrypt.compareSync(password, user.password)){
      return done(null, false, { message: 'Incorrect username or password.' })
    }
    return done(null, user);
  }
))

passport.serializeUser((user,done)=>{
    done(null,user.id);
})

passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    }).catch(err => {
        done(err);
    });
});

const userSchema = new mongoose.Schema({
    username: String,
    password: String
  });
const User = mongoose.model('User', userSchema);

const todoSchema = new mongoose.Schema({
    name: String
})

const Todo = mongoose.model('todo', todoSchema)

app.use((req,res,next) =>{
console.log(`${req.method} request for ${req.url}`);
next()
})

app.get('/', (req, res) =>{
res.render('index',{user: req.user})
})
app.get('/signup', (req, res)=>{
    res.render('signup');
})
app.post('/signup', async(req,res)=>{
    try{
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);
        const newUser = new User({username:req.body.username, password: hashedPassword});
        await newUser.save()
        res.redirect('/login');
    }catch(error){
        console.error(error, "error has happened in creating account");
        res.redirect('/signup')
    }
})

app.get('/login', (req, res)=>{
    res.render('login')
});

app.post('/login', passport.authenticate('local', {failureRedirect:'/login',failureMessage: true, successMessage:true} ), (req, res)=>{
    console.log(req.user);
    res.redirect('/' );
})

app.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});


app.get('/api/todos', async (req,res) =>{
    try {
        const todos = await Todo.find();
        console.log(todos);
        res.render('todos', {todos})
    } catch (error) {
        console.log(error);
        res.status(500).send('Error fetching from database')
    }
})

app.get('/api/todos/add', (req,res) =>{
    res.render('todoList.ejs');
})

app.get('/api/todos/add/:id', (req,res) =>{
    res.render('updateTodos.ejs');
})

app.post('/api/todos', async (req, res)=>{
    const {name} = req.body;
    const todo = new Todo({
        name
    });

    try {
        const result = await todo.save();
        console.log("saved to the database", result);
        res.redirect('/api/todos');
    } catch (err) {
        console.log(err);
        res.status(500).send('Error saving to database');
    }
})

app.post('/api/todos/delete/:id', async (req, res) => {
    const todoId = req.params.id;

    try {
        const result = await Todo.findOneAndDelete({ _id: todoId });
        if (result) {
            console.log("Deleted from the database", result);
            res.redirect('/api/todos');
        } else {
            res.status(404).send(`Item with the ID of ${todoId} not found.`);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting todo from the database');
    }
});


app.post('/api/todos/update/:id', async (req, res) => {
    const todoId = req.params.id;
    const updateName = req.body.name;

    try {
        const todo = await Todo.findByIdAndUpdate(todoId, { name: updateName }, { new: true });
        if (todo) {
            console.log("Updated in the database", todo);
            res.redirect('/api/todos');
        } else {
            res.status(404).send(`Item with the ID of ${todoId} not found.`);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating todo in the database');
    }
});

app.listen(port, ()=> {
    console.log(`Server running at http://localhost:${port}/`);
})