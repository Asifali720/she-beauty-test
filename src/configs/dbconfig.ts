import mongoose from 'mongoose'

export async function connect() {
  try {
    mongoose.connect(process.env.mongoUrl!)
    const connection = mongoose.connection

    connection.on('connected', () => {
      console.log('database connected')
    })

    connection.on('error', (err: any) => {
      console.log('Mongodb connection error, Please make sure MongoDb is running, ' + err)
      process.exit()
    })
  } catch (error) {
    console.log('something went wrong!')
    console.log(error)
  }
}
