
const user = require("./cmds_user.js");
const quiz = require("./cmds_quiz.js");
const favs = require("./cmds_favs.js");
const readline = require('readline');

//se agrega el módulo necesario para crear el servidor
const net = require('net');

//se agrega la variable necearia para que escuche en el muerto 8080 o el indicado en el tercer argumento de process
let port = (process.argv[2] || 8080);


//Se crea un array para contener al listado de clientes
let clientes = [];
let notPrompt = false;


//Se crea el servidor
let server = net.createServer((socket) => {
//socket.setEncoding('utf8');
//se añade el cliente al listado de sockets
clientes.push(socket);
//socket.write('Conectado'+clientes.toString());

//Crear una función para finalizar la conexión
let terminacion = async() => {
  let i = await clientes.indexOf(socket);
  clientes.splice(i,1);
  socket.end(); 
  rl.close();
  notPrompt = true;
}

//se define el comportamiento de la terminación de la conexión
socket.on('end',function () {
  let i = clientes.indexOf(socket);
  clientes.splice(i,1);
  socket.end(); 
  rl.close();
  notPrompt = true;
});

//socket.on('data', funtion())

//rl.log(`Welcome (Quizes Server) \n`);

/*
socket.on('data', function(data){

  process.stdin = data.toString();

});
    
*/

const rl = readline.createInterface({
  input: socket,
  output: socket,
  prompt: "> "
});


/*  //Version donde el input viene de stdin
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> "
});*/




//rl.log = (msg) => console.log(msg);  // Add log to rl interface

rl.log = (msg) => socket.write(msg+'\n\r');  // Add log to rl interface

rl.log(`Welcome (Quizes Server) \n\r`);

rl.questionP = function (string) {   // Add questionP to rl interface
  return new Promise ( (resolve) => {
    this.question(`  ${string}: `, (answer) => resolve(answer.trim()))
  })
};

rl.prompt();



rl.on('line', async (line) => {
  try{
    let cmd = line.trim()

    if      ('' ===cmd)   {}
    else if ('h' ===cmd)  { user.help(rl);}

    else if (['lu', 'ul', 'u'].includes(cmd)) { await user.list(rl);}
    else if (['cu', 'uc'].includes(cmd))      { await user.create(rl);}
    else if (['ru', 'ur', 'r'].includes(cmd)) { await user.read(rl);}
    else if (['uu'].includes(cmd))            { await user.update(rl);}
    else if (['du', 'ud'].includes(cmd))      { await user.delete(rl);}

    else if (['lq', 'ql', 'q'].includes(cmd)) { await quiz.list(rl);}
    else if (['cq', 'qc'].includes(cmd))      { await quiz.create(rl);}
    else if (['tq', 'qt', 't'].includes(cmd)) { await quiz.test(rl);}
    else if (['uq', 'qu'].includes(cmd))      { await quiz.update(rl);}
    else if (['dq', 'qd'].includes(cmd))      { await quiz.delete(rl);}

    else if (['lf', 'fl', 'f'].includes(cmd)) { await favs.list(rl);}
    else if (['cf', 'fc'].includes(cmd))      { await favs.create(rl);}
    else if (['df', 'fd'].includes(cmd))      { await favs.delete(rl);}

    else if ('e'===cmd)  { rl.log('Bye!'); await terminacion(); notPrompt = true; return; /*process.exit(0);*/}
    else                 {  rl.log('UNSUPPORTED COMMAND!');
                            user.help(rl);
                         };
    } catch (err) { rl.log(`  ${err}`);}
    finally       { if(!notPrompt) {rl.prompt(); }}
  });


  //Cierre del servidor
});

server.listen(port, function(){
  console.log("El servidor de quizes inicio en puerto 8080");
});

