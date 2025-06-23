
module.exports = {
    authIsOwner : (req,res)=>{
        var name = 'Guest';
        var login = false;
        var cls = 'NON';
        if(req.session.is_logined){ 
            name = req.session.name;
            login = true;
            cls = req.session.cls ;
        }
        return {name,login,cls}
    } ,
    dateOfEightDigit : ()=>{
        var today = new Date();
        var year = String(today.getFullYear());
        var month ;
        var day ;
        var hour;
        var minute;
        var second;
        if (today.getMonth() < 9)
            month = "0" + String(today.getMonth()+1);
        else
            month = String(today.getMonth()+1);

        if (today.getDate() < 10)
            day = "0" + String(today.getDate());
        else
            day = String(today.getDate());

        hour = String(today.getHours());
        minute = String(today.getMinutes());
        second = String(today.getSeconds());


        return year +"." + month + "." + day + " : " + hour + "시 " + minute + "분 " + second + "초";
}
}
