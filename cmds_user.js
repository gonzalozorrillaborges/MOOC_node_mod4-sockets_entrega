
const {User, Quiz} = require("./model.js").models;

exports.help = (rl) => 
  rl.log(
    `  Commands (params are requested after):\r
    > h              ## show help\r
    >\r
    > lu | ul | u    ## users: list all\r
    > cu | uc        ## user: create\r
    > ru | ur | r    ## user: read (show age)\r
    > uu             ## user: update\r
    > du | ud        ## user: delete\r
    >\r
    > lq | ql | q    ## quizzes: list all\r
    > cq | qc        ## quiz: create\r
    > tq | qt | t    ## quiz: test (play)\r
    > uq | qu        ## quiz: update\r
    > dq | qd        ## quiz: delete\r
    >\r
    > lf | fl | f    ## favourites: list all\r
    > cf | fc        ## favourite: create\r
    > df | fd        ## favourite: delete\r
    >\r
    > e              ## exit & return to shell\n\r`
  )

// Show all users in DB
exports.list = async (rl) => {

  let users = await User.findAll();
  
  users.forEach( u => rl.log(`  ${u.name} is ${u.age} years old`));
}

// Create user with age in the DB
exports.create = async (rl) => {

  let name = await rl.questionP("Enter name");
  if (!name) throw new Error("Response can't be empty!");

  let age = await rl.questionP("Enter age");
  if (!age) throw new Error("Response can't be empty!");

  await User.create( 
    { name, age }
  );
  rl.log(`   ${name} created with ${age} years`);
}

// Show user's age, quizzes & favourites
exports.read = async (rl) => {

  let name = await rl.questionP("Enter name");
  if (!name) throw new Error("Response can't be empty!");

  let user = await User.findOne({
    where: {name},
    include: [
      { model: Quiz, as: 'posts'},
      { model: Quiz, as: 'fav',
        include: [{ model: User, as: 'author'}]
      }
    ]
});
if (!user) throw new Error(`  '${name}' is not in DB`);

  rl.log(`  ${user.name} is ${user.age} years old`);

  rl.log(`    Quizzes:`)
  user.posts.forEach(
    (quiz) => rl.log(`      ${quiz.question} -> ${quiz.answer} (${quiz.id})`)
  );

  rl.log(`    Favourite quizzes:`)
  user.fav.forEach( (quiz) => 
    rl.log(`      ${quiz.question} -> ${quiz.answer} (${quiz.author.name}, ${quiz.id})`)
  );
}

// Update the user (identified by name) in the DB
exports.update = async (rl) => {

  let old_name = await rl.questionP("Enter name to update");
  if (!old_name) throw new Error("Response can't be empty!");

  let name = await rl.questionP("Enter new name");
  if (!name) throw new Error("Response can't be empty!");

  let age = await rl.questionP("Enter new age");
  if (!age) throw new Error("Response can't be empty!");

  let n = await User.update(
    {name, age}, 
    {where: {name: old_name}}
  );
  if (n[0]===0) throw new Error(`  ${old_name} not in DB`);

  rl.log(`  ${old_name} updated to ${name}, ${age}`);
}

// Delete user & his quizzes/favourites (relation: onDelete: 'cascade')
exports.delete = async (rl) => {

  let name = await rl.questionP("Enter name");
  if (!name) throw new Error("Response can't be empty!");

  let n = await User.destroy(
    { where: {name}}
  );
  if (n===0) throw new Error(`User ${name} not in DB`);

  rl.log(`  ${name} deleted from DB`);  
}

