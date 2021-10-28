const minutes = 40; // через сколько минут делать посты
const poster = require('./index');

/*-------------------------------------------------------------------*/
/*     |                       
/*     |                      Сообщения в консольку      
/*     V                        
/*-------------------------------------------------------------------*/
console.log(`Постеры успешно запущены. Делаем посты раз ${minutes} минут.`)
    /*-------------------------------------------------------------------*/
    /*     |                       
    /*     |                      Интервалы      
    /*     V                        
    /*-------------------------------------------------------------------*/
const mc = 60000;
const interval = minutes * mc;

setInterval(() => {
    poster.poster('lb');
}, interval);
setInterval(() => {
    poster.poster('lt');
}, interval + 6000);
setInterval(() => {
    poster.poster('fb');
}, interval + 12000);