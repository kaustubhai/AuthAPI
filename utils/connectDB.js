const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true
        })

        console.log('Database is up')
    } catch (error) {
        console.log('Database FAILED')
        console.log(error)
        process.exit(1)
    }
}

module.exports = connectDB