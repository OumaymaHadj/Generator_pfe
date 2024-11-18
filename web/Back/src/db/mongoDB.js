import { MongoClient, ObjectId } from "mongodb";

export default async function getAllMongoCollectionsAndFields(connection, dbName) {
  try {
    const client = connection.getClient(); // Get MongoDB native client
    const db = client.db(dbName); // Use the provided dbName
    const collections = await db.listCollections().toArray();

    if (!Array.isArray(collections) || collections.length === 0) {
      throw new Error('No collections found or unexpected response format from query');
    }

    const collectionDetails = [];

    for (const collection of collections) {
      const collectionName = collection.name;
      const documents = await db
        .collection(collectionName)
        .find()
        .limit(1)
        .toArray();

      const fields = documents.length > 0 ? Object.keys(documents[0])
        .filter(field => !["createdAt", "updatedAt", "__v"].includes(field)) // Filter fields to ignore
        .map(field => {
          const value = documents[0][field];
          let jsType;

          if (value instanceof Date) {
            jsType = 'Date';
          } else if (typeof value === 'object' && value !== null && value._id) {
            jsType = 'ObjectId';
          } else if (Array.isArray(value)) {
            jsType = 'array';
          } else if (typeof value === 'object' && value !== null) {
            jsType = 'object';
          } else {
            jsType = typeof value;
          }

          return {
            field: field,
            type: jsType,
            ...(field === '_id' && { pk: true }), // Mark _id as primary key
          };
        }) : []; 

      collectionDetails.push({
        name: collectionName,
        fields: fields,
      });
    }
    console.log(JSON.stringify(collectionDetails, null, 2));

    return collectionDetails;

  } catch (err) {
    console.error(`Error retrieving MongoDB collections and fields: ${err.message}`);
    throw err;
  }
}

/*export default async function getAllMongoCollectionsAndFields(connection, dbName) {
  try {
    const client = connection.getClient(); // Récupérer le client MongoDB natif
    const db = client.db(dbName); // Utiliser dbName passé en paramètre
    const collections = await db.listCollections().toArray();

    if (!Array.isArray(collections) || collections.length === 0) {
      throw new Error('No collections found or unexpected response format from query');
    }

    const collectionDetails = [];

    for (const collection of collections) {
      const collectionName = collection.name;
      const documents = await db
        .collection(collectionName)
        .find()
        .limit(1)
        .toArray();

        const fields = documents.length > 0 ? Object.keys(documents[0])
        .filter(field => !["createdAt", "updatedAt", "__v"].includes(field)) // Filtrer les champs à ignorer
        .map(field => {
          const value = documents[0][field];
          let jsType;
      
          if (value instanceof Date) {
            jsType = 'Date';
          } else if (typeof value === 'object' && value !== null && value._id) {
            jsType = 'ObjectId';
          } else if (Array.isArray(value)) {
            jsType = 'array';
          } else if (typeof value === 'object' && value !== null) {
            jsType = 'object';
          } else {
            jsType = typeof value;
          }
          return {
            field: field,
            type: jsType,
          };
        }) : []; 

      collectionDetails.push({
        name: collectionName,
        fields: fields,
      });
    }

    return collectionDetails;

  } catch (err) {
    console.error(`Error retrieving MongoDB collections and fields: ${err.message}`);
    throw err;
  }
}
*/