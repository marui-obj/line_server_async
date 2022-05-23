const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TaskSchema = Schema({
    user_id: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type:String,
        required: true,
    },
    province: {
        type: String
    },
    frequency: {
        type: String
    },
    time: {
        type: String
    }
})

const Task = mongoose.model('Task', TaskSchema);

const findTask = async(query) => {
    try{
        return await Task.findOne(query);
    } catch(e) {
        throw new Error(e);
    }
}

const createTask = async(userId, status) => {
    const newTask = new Task({
        user_id: userId,
        status: status
    });
    try{
        return await Task.create(newTask);
    } catch(e) {
        throw new Error(e);
    }
}

const updateTask = async(id, update) => {
    try{
        return await Task.findByIdAndUpdate(id, { $set: update }, {new: true})
    } catch(e) {
        throw new Error(e);
    }
}

const findByIdAndDelete = async(id) => {
    try{
        return await Task.findByIdAndDelete(id);
    } catch(e) {
        throw new Error(e);
    }
}

const findOneAndDelete = async(query) => {
    try{
        return await Task.findOneAndDelete(query)
    } catch(e) {

    }
}

module.exports = {
    findTask,
    createTask,
    updateTask,
    findByIdAndDelete,
    findOneAndDelete
}