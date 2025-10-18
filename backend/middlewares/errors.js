import ErrorHandler from '../utils/errorHandler.js';



export default (err, req, res, next) => {
    let error = {
        statusCode: err?.statusCode || 500,
        message: err?.message || 'Internal Server Error'
    };


    // handle invalid mongooes ID Error
    if(err.name === 'CastError') {
        const message =`Resource not Found. Invalid: ${err?.path}`
        error = new ErrorHandler(message, 404);
    }

    // handle validation Error
    if(err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((value) => value.message)
        error = new ErrorHandler(message, 400);
    }


    // Handle Mongoose Duplicate key Error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered.`;
        error = new ErrorHandler(message, 400); // Change to 400 for bad request
    }


     // handle Wrong JWT Error
     if(err.name === 'JsonWebTokenError') {
        const message =`Json Web Token Is Invalid, Try Again!!!.`
        error = new ErrorHandler(message, 400);
    }


     // handle Expired  JWT Error
     if(err.name === 'TokenExpiredError') {
        const message =`Json Web Token Is Expired, Try Again!!!.`
        error = new ErrorHandler(message, 400);
    }



    if (process.env.NODE_ENV === 'DEVELOPMENT') {
        res.status(error.statusCode).json({
            message: error.message,
            error: err,
            stack: err?.stack
        });
    } else if (process.env.NODE_ENV === 'PRODUCTION') {
        res.status(error.statusCode).json({
            message: error.message
        });
    }


    



    
};
