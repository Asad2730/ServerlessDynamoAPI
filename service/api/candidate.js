const uuid = require('uuid');
const aws = require('aws-sdk');

aws.config.setPromisesDependency(require('bluebird'));
const db = new aws.DynamoDB.DocumentClient();

exports.submit = async (event) => {
  try {
    const requestBody = JSON.parse(event.body);
    const { name, email, experience } = requestBody;

    if (typeof name !== 'string' || typeof email !== 'string' || typeof experience !== 'number') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Validation error: Name and email must be strings, experience must be a number' })
      };
    }

    const candidate = exports.candidateInfo(name, email, experience);

    await submitCandidate(candidate);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Successfully submitted candidate with email ${email}`,
        candidateId: candidate.id
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Unable to submit candidate` })
    };
  }
};

const submitCandidate = async (candidate) => {
  const params = {
    TableName: 'your_table_name',
    Item: candidate
  };

  try {
    await db.put(params).promise();
  } catch (err) {
    throw err;
  }
};

exports.candidateInfo = (name, email, experience) => {
  const timeStamp = new Date().getTime();
  return {
    id: uuid.v1(),
    name: name,
    email: email,
    experience: experience,
    submittedAt: timeStamp,
    updatedAt: timeStamp
  };
};




exports.list = async (event) =>{
  try{
  let items = await db.scan({
    TableName:'your_table_name',
    ProjectionExpression:'id,name,email'
  }).promise()

  return {
    statusCode: 200,
    body: JSON.stringify({
      canditates:items.Items,
    })
  };
  }catch(err){
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Unable to get candidates` })
    };
  }
}


exports.get = async(event) => {
  try{
   let item = await db.get({
    TableName:'your_table_name',
    Key:event.pathParameters.id,
   }).promise()
   return {
    statusCode: 200,
    body: JSON.stringify({
      candidate: item.Item
    })
  };
  }catch(err){
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Unable to get candidate` })
    };
  }
}




