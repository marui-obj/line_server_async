const { lineClient } = require('../configs/line.config');
const Task = require('../models/Task');
const axios = require('axios');
const jobApi = require('../configs/job.config');
const { query } = require('express');

const handleEvent = async (event) => {
    switch(event.type){
        case 'message':
            const message = event.message;
            switch(message.type){
                case 'text':
                    const query = {
                        user_id: event.source.userId,
                    }
                    Task.findTask(query)
                    .then(res =>{
                        if(res) {
                            if (res.status === 'create') return handleSetNotify(message, event.replyToken, event.source, res);
                            else if (res.status === 'delete') return handleunsubNotify(message, event.replyToken, event.source, res);
                        }
                        else return handleText(message, event.replyToken, event.source);
                    });
                default:
                    return;
            }
        default:
            return;
    }
}

const handleText = async(message, replyToken, source) => {
    try{
        switch(message.text){
            case '#สร้างแจ้งเตือน':
                await Task.createTask(source.userId, "create");
                return replyText(
                    replyToken,
                    ["สร้างการแจ้งเตือน โปรดพิมพ์จังหวัดที่ต้องสร้าง"]
                );
            case '#ยกเลิกแจ้งเตือน':
                await Task.createTask(source.userId, "delete");
                return replyText(
                    replyToken,
                    ["ยกเลิกการแจ้งเตือน โปรดพิมพ์จังหวัดที่ต้องยกเลิก"]
                );
            case '#check':
                return replyText(
                    replyToken,
                    ["Server Ok!"]
                );
            default:
                return replyText(
                    replyToken,
                    ["Command not found"]
                )
        }
    } catch(e) {
        throw new Error(e.message);
    }
    
}

const replyText = (token, texts) => {
    try{
        texts = Array.isArray(texts) ? texts: [texts];
        return lineClient.replyMessage(
            token,
            texts.map((text) => ({type: 'text', text}))
        );
    } catch(e) {
        throw new Error(e.message);
    }
}

const pushMessage = async(userId, texts) => {
    try{
        texts = Array.isArray(texts) ? texts: [texts];
        return await lineClient.pushMessage(
            userId,
            texts.map((text) => ({type: 'text', text}))
        );
    } catch(e) {
        throw new Error(e.message);
    }
}

const handleSetNotify = async(message, replyToken, source, task) => {
    const available_province = ['กรุงเทพ', 'นครปฐม', 'ทุกจังหวัด'];
    try{
        if(message.text === '#ยกเลิกสร้างแจ้งเตือน'){
            return handleAbortNotify(message, replyToken, source);
        } else if (!task.province){
            switch(available_province.includes(message.text)){
                case true:
                    const update = {
                        province: message.text,
                    }
                    await Task.updateTask(task.id, update);
                    return replyText(
                        replyToken,
                        ['เลือกเป็นจังหวัด: ' + message.text, 'โปรดพิมพ์ความถี่']
                    );
                case false:
                    return replyText(
                        replyToken,
                        ["ไม่มีจังหวัดนี้จ้า โปรดลองใหม่อีกครั้ง"]
                    );
            }
        } else if(!task.frequency) {
            available_frequency = ['วินาที', 'นาที', 'ชั่วโมง']
            switch(available_frequency.includes(message.text)){
                case true:
                    const update = {
                        frequency: message.text
                    }
                    const result = await Task.updateTask(task.id, update);

                    return replyText(
                        replyToken,
                        [`ทำการแจ้งเตือน ${result.province} ความถี่ ${result.frequency}`, 'โปรดพิมพ์เวลา']
                    );
                case false:
                    return replyText(
                        replyToken,
                        ['ความถี่ไม่ถูกต้อง โปรดลองอีกครั้ง']
                    );
            }
            
        } else if (!task.time) {
            switch(isNumeric(message.text)){
                case true:
                    const update = {
                        time: message.text
                    }
                    const result = await Task.updateTask(task.id, update);
                    // API GO HERE!
                    console.log(result);

                    const body = {
                        uid: result.user_id,
                        time: Number(result.time),
                        unit: result.frequency,
                        temp: 15.0,
                        province: result.province
                    }

                    axios.post(jobApi.api + '/noti/set', body)
                    .then((res) => {
                        console.log(res);
                    })
                    .catch((e) => {
                        console.log(e.message);
                    })

                    // Delect task
                    await Task.findByIdAndDelete(task.id);

                    return replyText(
                        replyToken,
                        [`ทำการแจ้งเตือน ${result.province} ความถี่ ${result.time} ${result.frequency}`, 'สร้างการแจ้งเตือนเสร็จสิ้น']
                    );
                case false:
                    return replyText(
                        replyToken,
                        ['โปรดใส่เป็นตัวเลขเท่านั้น']
                    );
            }
        } else {
            return replyText(
                replyToken,
                ['โปรดลองใหม่อีกครั้ง']
            );
        }
    } catch(e) {
        throw new Error(e.message);
    }
}

const handleAbortNotify = async(message, replyToken, source) => {
    try{
        const query = {
            userId: source.userId
        }
        Task.findTask(query)
            .then(res =>{
                if (res) {
                    const query = {
                        userId: source.userId
                    }
                    Task.findOneAndDelete(query)
                    .then(() => {
                        return replyText(
                            replyToken,
                            ['ยกเลิกการสร้างการแจ้งเตือน']
                        );
                    })
                }
                else {
                    return replyText(
                        replyToken,
                        ['ไม่มีการแจ้งเตือนที่ต้องยกเลิก']
                    );
                }
            });
    } catch(e) {
        throw new Error(e.message);
    }
}

const handleunsubNotify = async(message, replyToken, source, task) => {
    const available_province = ['กรุงเทพ', 'นครปฐม', 'ทุกจังหวัด'];
    try{
            if (!task.province){
            switch(available_province.includes(message.text)){
                case true:
                    const update = {
                        province: message.text,
                    }
                    await Task.updateTask(task.id, update);

                    const query = {
                        userId: source.userId
                    }
                    const result = await Task.findOneAndDelete(query);

                    const body = {
                        uid: result.user_id,
                        status:"0",
                        province: result.province
                    }

                    console.log('request body : ' + body)
                    axios.post(jobApi.api + '/noti/config_notify', body)
                    .then((res) => {
                        console.log(res);
                    })
                    .catch((e) => {
                        console.log(e.message);
                    })
                    return replyText(
                        replyToken,
                        ['ยกเลิกการแจ้งเตือนจากจังหวัด: ' + message.text]
                    );
                case false:
                    return replyText(
                        replyToken,
                        ["ไม่มีจังหวัดนี้จ้า โปรดลองใหม่อีกครั้ง"]
                    );
            }
        }
    } catch(e) {
        throw new Error(e.message);
    }
}

const isNumeric = (val) => {
    return /^-?\d+$/.test(val);
}

module.exports = {
    handleEvent,
    pushMessage
}