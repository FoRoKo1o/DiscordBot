module.exports = {
  name: 'test',
  description: 'testowa komenda',
  usage: 'test',
  execute: async(message, args) => {
    console.log('wyperdalaj');
    message.channel.send('test') ;
  }
}