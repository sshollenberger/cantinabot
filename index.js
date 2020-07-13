const Discord = require('discord.js');
const config = require('./config.js');
const bot = new Discord.Client();
const token = config;
const PREFIX = '!';

var pid1, pid2;
var p1, p2, game;
var sp=false;
//console.log('Cantina-Bot lives!');
bot.on('ready', ()=>{
    //console message to show that the bot is online
    console.log('Cantina-Bot lives!');
});

function MessageDelete(message, response){
    if (message.channel.type !== 'dm' ) {
        try{
            message.delete(message);
            }catch{        
            }
    }
    message.channel.send({embed: {
        color: 3447003,
        description: response
    }});
}
function Message(message, response){
    message.channel.send({embed: {
        color: 3447003,
        description: response
    }});
}
function DirectMessageDelete(message, msg){
    //message.channel.send(msg)
    
    if (message.channel.type !== 'dm' ) {
        try{
        message.delete(message);
        }catch{        
        }
    }
    message.author.send({embed: {
        color: 3447003,
        description: msg
    }});
    return;
}
function DirectMessage(message, msg){
    //message.channel.send(msg)
    message.send({embed: {
        color: 3447003,
        description: msg
    }});
    return;
}
function PictureMessage(message, msg, file){
    //message.channel.send(msg, {files:[file]})
    message.channel.send({embed: {
        color: 3447003,
        description: msg,
        files:[file]
    }});
}

/* /// Kept for reference purposes
function PictureMessageReact(message, msg, file){
    message.channel.send({embed: {
        color: 3447003,
        description: msg,
        files:[file]
    }}).then(sentEmbed => {
        sentEmbed.react("1️⃣")
        sentEmbed.react("2️⃣")
        sentEmbed.react("3️⃣")
        sentEmbed.react("4️⃣")
        return
    })
}
*/
async function MessageReactOk(message, msg){
    try{
        const posted = await message.channel.send({embed: {
            color: 3447003,
            description: msg
        }})
        posted.react("✅")
        posted.react("❌")
        return posted;
    } catch(err){
        console.log('MessageReactOk failed');
    }
}
async function PictureMessageReact(message, msg, file, cards){
        try{
            const posted = await message.channel.send({embed: {
                color: 3447003,
                description: msg,
                files:[file]
            }})
            if (cards.includes(1))
            posted.react("1️⃣")
            if (cards.includes(2))
            posted.react("2️⃣")
            if (cards.includes(3))
            posted.react("3️⃣")
            if (cards.includes(4))
            posted.react("4️⃣")
            posted.react("❌")
            return posted;
        } catch(err){
            console.log('PictureMessageReact failed');
        }
}
bot.on('message',message=>{
    let args = message.content.substring(PREFIX.length).split(" ");
    //do not accept messages from bots
    if(message.author.bot) return;
    if(message.content.startsWith(PREFIX)){
    switch(args[0]){
        case 'help':
            Message(message, 'How to play: !play to start a match.  !quit to stop a match.  \n At the start, each player is given 4 cards.  These cards can be used 1 time every round to change your score. \n The player closest to 20 points without going over is the winner.  The best of 3 matches decides the game.');
        break;
        case 'about':
        break;
        case 'play':            
            if(pid1==undefined){
                pid1=message.author;
                MessageDelete(message, pid1.username+' joined. Waiting for player 2. !play to join game ');
                //MessageDelete(message, pid1.username+' joined. Waiting for player 2. !play to join game !sp to play against the computer');
            }else if(pid2==undefined&&message.author!=pid1){
                pid2=message.author;
            //the game can now start
            MessageDelete(message, pid2.username+' joined. Dealing cards.  !help for rules');
            p1=new Player(pid1.username)
            p2=new Player(pid2.username)
            //p2=new Player("other guy")
            game=new Game(message, p1,p2);
            game.startGame();           
            }
        break;
        case 'sp':
            if(pid1!==undefined&&pid2==undefined&&sp==false){
                //single player game
                sp==true;
                //the game can now start
                MessageDelete(message, pid1.username+' started a single player game. Dealing cards.  !help for rules');
                p1=new Player(pid1.username)
                p2=new Player("Computer")
                game=new Game(message, p1,p2);
                game.startGame(); 
            }else{
                MessageDelete(message, pid1.username+' you cannot start a single player game.  !help for rules');
            }
        break;
        case 'bet':
            if(game!==undefined){
                if(args[1]!==undefined && !isNaN(args[1])){
                    if(game.getBetting()&&(message.author.username==p1.getName()||message.author.username==p2.getName())){
                        if(args[1]>= game.getWager()||game.getWager()==undefined){
                        game.setWager(args[1]);                  
                        MessageDelete(message, message.author.username+" bet "+game.getWager());
                        /*
                        if(game.getTurn()==p1.getName()){
                            game.setTurn(p2.getName());
                        }else{
                            game.setTurn(p1.getName());
                        }
                        */
                        //Message(message, "What is your wager? ex: !bet 1000 If betting is done, type !start")  
                        ///////////////////////////////////
            MessageReactOk(message, "What is your wager? ex: !bet 1000 If betting is done, press ✅ to start or ❌ to quit the game")
            .then(post=>{
                const start='✅';
                const quit='❌';
                const filter=(reaction, user)=>{
                    return[start, quit].includes(reaction.emoji.name)&& user.id===message.author.id;
                };
                post.awaitReactions(filter, {max:1, time:300000, errors:['time']})
                    .then(collected=>{
                        const reaction=collected.first();                                            
                        switch(reaction.emoji.name){
                        case start:
                            game.nextTurn();
                        break;
                        case quit:
                            Quit()
                            Message(message, message.author.username+" has ended the game. FUUUU (╯°□°）╯︵ ┻━┻   !play to start a game");
                        break;
                        }
                        
                    })
                    .catch(collected=>{
                        console.log("no one reacted")
                        Message(message, "Falling asleep.   !play to start a new game")
                    })             
            })
////////////////////////////////////                      
                        }else{
                        MessageDelete(message, message.author.username+", your bet must exceed or match the current highest bet: "+game.getWager());
                        }
                    }else{
                        MessageDelete(message, message.author.username+", you cannot bet this round.");
                    }                   
                }else{
                    MessageDelete(message, message.author.username+", that is not a valid bet. ex: !bet 1000");
                }
            }else{
                MessageDelete(message, message.author.username+", there is currently no game. !play to start a game");
            }
        break;
        case 'quit':
            Quit();
            MessageDelete(message, message.author.username+" has ended the game. FUUUU (╯°□°）╯︵ ┻━┻   !play to start a game");
        break;
        case 'startfff':
            if(message.author.username==game.getTurn()&&game.getWager()!==undefined){
                game.nextTurn();
            }else{
                MessageDelete(message, message.author.username+" Either it is not your turn, or you have not made a bet. ex: !bet 2000")
            }
        break;
        case 'endfff':
            if(message.author.username==game.getTurn()&&game.getWager()!==undefined){
                game.endTurn();
            }else{
                MessageDelete(message, message.author.username+" Either it is not your turn, or you have not made a bet. ex: !bet 2000")
            }
        break;
        case 'test2352435':
            PictureMessageReact(message,"Roooorroooor", './pazaaktable1.jpg')
            .then(post=>{
                const one='1️⃣';
                const two='2️⃣';
                const three='3️⃣';
                const four='4️⃣';
                const skip='❌';
                const filter=(reaction, user)=>{
                    return[one, two, three, four].includes(reaction.emoji.name)&& user.id===message.author.id;
                };
                post.awaitReactions(filter, {max:1, time:60000, errors:['time']})
                    .then(collected=>{
                        const reaction=collected.first();                                            
                        switch(reaction.emoji.name){
                        case one:
                            console.log(message.author.username+" reacted with a 1")
                        break;
                        case two:
                            console.log(message.author.username+" reacted with a 2")
                        break;
                        case three:
                            console.log(message.author.username+" reacted with a 3")
                        break;
                        case four:
                            console.log(message.author.username+" reacted with a 4")
                        break;
                        case skip:
                            console.log(message.author.username+" reacted with a skip")
                        break;
                        }
                        
                    })
                    .catch(collected=>{
                        console.log("no one reacted")
                        Message(message, "Falling asleep.   !play to start a new game")
                    })             
            })
            .catch(err=>{
                console.log('failed to get object from PictureMessageReact')
            })    
            
           
            break;
    }
    }
});


const Deck= [
1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
]
const SideDeck=[
'-1','-2','-3','-4','-5','-6',
 '+1', '+2', '+3', '+4', '+5', '+6',
'-1','-2','-3','-4','-5','-6',
]

function Shuffle(a){
    var j, x, i, deck;
    deck=a.slice();
    for (i = deck.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = deck[i];
            deck[i] = deck[j];
            deck[j] = x;
        }
    return deck;
}
function Quit(){
pid1=pid2=p1=p2=game=undefined;
}
function Random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
function DrawCards(n, deck){
    var cards=deck.splice(0,n)
    return cards;
}
function AddCards(cards,deck){
cards.forEach(element => {
   deck.push(element); 
});
}
function PickSideDeck(){
    var sideDeck=[];
    var n;
    for(var i=0;i<4; i++){
        n=Random(0,SideDeck.length-1)
        sideDeck.push(SideDeck[n])
    }
    return sideDeck;
}
function Player(name){
    var playerName=name;
    var score=wins=0; 
    var sideDeck=[];
    var activeCards=[1,2,3,4]
    this.getName=()=>{
            return playerName;
    }
    this.getScore=()=>{
        return score;
    }
    this.setScore=(newScore)=>{
        score=newScore;
        //console.log('Player '+playerName+"'s Score:"+score);
    }
    this.getSideDeck=()=>{
        //console.log(sideDeck);
        return sideDeck;
    }
    this.setSideDeck=(newDeck)=>{
        sideDeck=newDeck;
    }
    this.getWins=()=>{
        return wins;
    }
    this.setWins=(newWins)=>{
        wins=newWins;
    }
    this.getActiveCards=()=>{
        return activeCards;
    }
    this.playCard=(num)=>{
        if(sideDeck[num]!==undefined){
           var card=sideDeck[num];
           //remove from the list of active cards
           activeCards = activeCards.filter(item => item !== num+1)
            if(card.length==3){
                //console.log(playerName+" has picked a special card "+card)
            }else if(card.slice(0,1)=='-'){
                //console.log(playerName+" has picked a negative card "+card)
                score-=parseInt(card.slice(1));
            }else{
                //console.log(playerName+" has picked a positive card "+card)
                score+=parseInt(card.slice(1));
            }
            //console.log("He has a score of "+score+" for this round.");
        }else{
            //console.log("Error: "+playerName+"'s card is undefined.")
        }
    }

}
function Game(message, p1, p2){
var wager, winner, mainDeck, turn;
var p1wins=p2wins=0;
var betting=singlePlayer=false;
    this.startGame=()=>{
        //shuffle the main deck
        mainDeck=Deck;
        mainDeck=Shuffle(mainDeck);
        
        //give each player their side deck
        p1.setSideDeck(PickSideDeck());
        p2.setSideDeck(PickSideDeck());
        //roll to decide who goes first
        var firstTurn=Random(1,2);
        if(firstTurn==1){
            turn=p1.getName();
            PictureMessage(message, p1.getName()+" goes first.  What is your wager? ex: !bet 1000", './credit chip.jpg')
            betting=true;
          
        }else{
            turn=p2.getName();
            PictureMessage(message, p2.getName()+" goes first.  What is your wager? ex: !bet 1000", './credit chip.jpg')
            betting=true;
    
        }
        //DM each player their side decks
        var side1=p1.getSideDeck();
        var side2=p2.getSideDeck();
        var res1=res2='Your side deck: [   ';
        for(var i=0;i<side1.length;i++){
            res1+=side1[i]+'   ';
        }
        res1+=']'
        for(var i=0;i<side2.length;i++){
            res2+=side2[i]+'   ';
        }
        res2+=']'
        DirectMessage(pid1,res1)
        DirectMessage(pid2,res2)
    }
    this.nextTurn=()=>{
        //check if the score is 20 for either character
        //if there is a tie
        //Message(message, "........")
        console.log("player 1: "+p1wins+" player 2: "+ p2wins)
        if(p1wins<3&&p2wins<3){
        if(p1.getScore()==20 && p2.getScore()==20){
            //it's a tie
            p1.setScore(0);
            p2.setScore(0);
            Message(message, "It's a tie.")
        }
        else if(p1.getScore()>20){
            //player 2 wins the round
            //var winner=p2.getWins()+1;
            //p2.setWins(winner);
            p2wins++;
            p1.setScore(0);
            p2.setScore(0);
            Message(message, p2.getName()+" wins the round")
        }
        else if(p2.getScore()>20){
            //player 1 wins the round
            //var winner=p1.getWins()+1;
            //p1.setWins(winner);
            p1wins++;
            p1.setScore(0);
            p2.setScore(0);
            Message(message, p1.getName()+" wins the round")
        }
        }else{
            
        }
        //player 1's turn
        if(turn==p1.getName()){
            var card = DrawCards(1, mainDeck);
            p1.setScore(p1.getScore()+card[0]);
///////////////////////////////////
            PictureMessageReact(message, p1.getName()+" draws a "+card[0]+". Your score is "+p1.getScore()+".  React 1, 2, 3, 4, to play a side card or ❌ to end your turn", './pazaaktable1.jpg',p1.getActiveCards())
            .then(post=>{
                if(p1wins>=3){
                    var winnersPot=wager*2;
                    Message(message,"Congrats!! "+p1.getName()+" has won the game!! You gain "+winnersPot+" credits")
                    Quit();
                    //return;
                }
                else if(p2wins>=3){
                    var winnersPot=wager*2;
                    Message(message, "Congrats!! "+p1.getName()+" has won the game!! You gain "+winnersPot+" credits")
                    Quit();
                    //return;
                }

                const one='1️⃣';
                const two='2️⃣';
                const three='3️⃣';
                const four='4️⃣';
                const skip='❌';
                const filter=(reaction, user)=>{
                    return[one, two, three, four, skip].includes(reaction.emoji.name)&& user.username===p1.getName();
                };
                post.awaitReactions(filter, {max:1, time:1200000, errors:['time']})
                    .then(collected=>{
                        const reaction=collected.first();                                            
                        switch(reaction.emoji.name){
                        case one:
                            console.log(message.author.username+" reacted with a 1")
                            p1.playCard(0)
                            Message(message, p1.getName()+" used their card "+p1.getSideDeck()[0]+". Their score is now "+p1.getScore())
                            game.nextTurn();
                        break;
                        case two:
                            console.log(message.author.username+" reacted with a 2")
                            p1.playCard(1)
                            Message(message, p1.getName()+" used their card "+p1.getSideDeck()[1]+". Their score is now "+p1.getScore())
                            game.nextTurn();
                        break;
                        case three:
                            console.log(message.author.username+" reacted with a 3")
                            p1.playCard(2)
                            Message(message, p1.getName()+" used their card "+p1.getSideDeck()[2]+". Their score is now "+p1.getScore())
                            game.nextTurn();
                        break;
                        case four:
                            console.log(message.author.username+" reacted with a 4")
                            p1.playCard(3)
                            Message(message, p1.getName()+" used their card "+p1.getSideDeck()[3]+". Their score is now "+p1.getScore())
                            game.nextTurn();
                        break;
                        case skip:
                            console.log(message.author.username+" reacted with a skip")
                            game.nextTurn();
                        break;
                        }
                        
                    })
                    .catch(collected=>{
                        console.log("no one reacted")
                        Message(message, "Falling asleep.   !play to start a new game")
                        Quit()
                    })             
            })
////////////////////////////////////
        turn=p2.getName();
        //player 2's turn
        }else if(turn==p2.getName()){
            var card = DrawCards(1, mainDeck);
            p2.setScore(p2.getScore()+card[0]);
///////////////////////////////////
PictureMessageReact(message, p2.getName()+" draws a "+card[0]+". Your score is "+p2.getScore()+".  React 1, 2, 3, 4, to play a side card or ❌ to end your turn", './pazaaktable2.jpg',p2.getActiveCards())
.then(post=>{
    if(p1wins>=3){
        var winnersPot=wager*1;
        Message(message,"Congrats!!🎉🎉 "+p1.getName()+" has won the game!! 🎉🎉 You gain "+winnersPot+" credits")
        Quit();
        //return;
    }
    else if(p2wins>=3){
        var winnersPot=wager*1;
        Message(message, "Congrats!!🎉🎉 "+p1.getName()+" has won the game!! 🎉🎉 You gain "+winnersPot+" credits")
        Quit();
        //return;
    }

    const one='1️⃣';
    const two='2️⃣';
    const three='3️⃣';
    const four='4️⃣';
    const skip='❌';
    const filter=(reaction, user)=>{
        return[one, two, three, four, skip].includes(reaction.emoji.name)&& user.username===p2.getName();
    };
    post.awaitReactions(filter, {max:1, time:1200000, errors:['time']})
        .then(collected=>{
            const reaction=collected.first();                                         
            switch(reaction.emoji.name){
            case one:
                console.log(message.author.username+" reacted with a 1")
                p2.playCard(0)
                Message(message, p2.getName()+" used their card "+p2.getSideDeck()[0]+". Their score is now "+p2.getScore())
                game.nextTurn();
            break;
            case two:
                console.log(message.author.username+" reacted with a 2")
                p2.playCard(1)
                Message(message, p2.getName()+" used their card "+p2.getSideDeck()[1]+". Their score is now "+p2.getScore())
                game.nextTurn();
            break;
            case three:
                console.log(message.author.username+" reacted with a 3")
                p2.playCard(2)
                Message(message, p2.getName()+" used their card "+p2.getSideDeck()[2]+". Their score is now "+p2.getScore())
                game.nextTurn();
            break;
            case four:
                console.log(message.author.username+" reacted with a 4")
                p2.playCard(3)
                Message(message, p2.getName()+" used their card "+p2.getSideDeck()[3]+". Their score is now "+p2.getScore())
                game.nextTurn();
            break;
            case skip:
                console.log(message.author.username+" ended their turn")
                console.log(message.author.username+" reacted with a skip")
                game.nextTurn();
            break;
            }
            
        })
        .catch(collected=>{
            console.log("no one reacted")
            Message(message, "Falling asleep.   !play to start a new game")
            Quit()
        })             
})
////////////////////////////////////
        turn=p1.getName();
        }
}//end nextTurn
    this.getTurn=()=>{
        return turn;
    }
    this.setTurn=(newTurn)=>{
        turn=newTurn;
    }
    this.getBetting=()=>{
        return betting;
    }
    this.setBetting=(bet)=>{
        betting=bet;
    }
    this.getWager=()=>{
        return wager;
    }
    this.setWager=(w)=>{
        wager=w;
    }
}

bot.login(token.token);

