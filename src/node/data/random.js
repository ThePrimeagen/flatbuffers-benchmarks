module.exports = {
    randomListItem(list) {
        return list[Math.floor(Math.random() * list.length)];
    },
    
    random(max, min, precision) {
        min = min || 0;
        precision = precision || 1;
        
        const diff = max - min;
        return (Math.floor((Math.random() * diff) * precision) / precision) + min;
    }
};
