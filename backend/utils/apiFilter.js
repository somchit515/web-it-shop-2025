import { json } from "express";

class APIFilters {
    constructor (query, queryStr) {
        this.query = query
        this.queryStr = queryStr
    }
    search () {
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: 'i'
            }
        } : {} 
        this.query = this.query.find({...keyword});
        return this;
    }
    filters () {
    const queryCopy = { ...this.queryStr };

    // Fields to remove that are not actual filters
    const fieldsToRemove = ["keyword", "page"];
    fieldsToRemove.forEach(el => delete queryCopy[el]);

    // Create a base object to store filters
    const filterObj = {};

    // ✅ Category
    if (queryCopy.category) {
        filterObj.category = queryCopy.category;
    }

    // ✅ Ratings (ใช้ $gte)
    if (queryCopy.rating) {
        filterObj.ratings = { $gte: Number(queryCopy.rating) };
    }

    // ✅ Price (แปลง min เป็น $gte, max เป็น $lte)
    if (queryCopy.min || queryCopy.max) {
        filterObj.price = {};
        if (queryCopy.min) filterObj.price.$gte = Number(queryCopy.min);
        if (queryCopy.max) filterObj.price.$lte = Number(queryCopy.max);
    }

    // Apply filter to Mongoose query
    this.query = this.query.find(filterObj);

    return this;
}

    pagination (resPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resPerPage * (currentPage - 1);

        this.query = this.query.limit(resPerPage).skip(skip);
        return this;
    }
} 
export default APIFilters;