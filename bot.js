var TelegramBot = require('node-telegram-bot-api')
var token = '1200240150:AAEZcBC-_3TAPRQaVyVc_r2LD6RQ9kyH2Go'
var bot = new TelegramBot(token, { polling: true})
var request = require('request')

// intro bot semua orang bisa melihat produk tanpa harus melengkapi data.
// data customer di perlukan saat inputan order
bot.onText(/\/start|\halo/, msg => {
    bot.sendMessage(msg.chat.id, `Hallo ${msg.chat.first_name} Selamat Datang di Fadhel Store`);
    bot.sendMessage(msg.chat.id, `Untuk melihat product silahkan ketik : /product`)
    bot.sendMessage(msg.chat.id, `Untuk melakukan order silahkan ketik : /order`)
});


// request product oleh
bot.onText(/\/product/, msg =>{

    var chatid = msg.chat.id
    var requrl = 'http://localhost:8000/product'
        request(requrl, function(error,response,body){
            var json = JSON.parse(body)
            var data = json.data
            var nama = data.map(e => `${e.name} : ${e.price}`).join(',')
            var result = nama.replace(',',' ')
            bot.sendMessage(chatid,`product yang tersedia adalah \n${result}`)
        })
})

// order dari user

bot.onText(/\/order/, msg =>{
    bot.sendMessage(msg.chat.id, `Hallo ${msg.chat.first_name}, sebelum order kamu harus isi data lengkap dibawah dulu ya`);
    bot.sendMessage(msg.chat.id, `format nya seperti ini : nama-username-email-notelp `);
})

//stuck di menambahkan data customer dan order