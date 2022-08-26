import express from 'express';
import { Request, Response } from 'express';
import fs from "fs";
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */
  app.get( "/filteredimage", async ( req: Request, res: Response ) => {
    const image_url = req.query.image_url;

    if (!image_url) {
      return res.status(400).send({ message: 'image_url query parameter is required.' });
    }

    if (!validateImageExtension(image_url)) {
      return res.status(400).send({ message: `${image_url} is not a valid image.` });
    }

    const filtered_image = await filterImageFromURL(image_url);

    res.sendFile(filtered_image);
    
    const tmp_path = './util/tmp/';

    fs.readdir(tmp_path, (err, files) => {
      const fullpath_files = files.map(file => tmp_path + file);
      if (fullpath_files.length > 0) {
        deleteLocalFiles(fullpath_files);
      }
    });

  } );

  function validateImageExtension(image_url: string): boolean {
    const valid_extensions = ['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'];

    const image_extension = image_url.split('.')[(image_url.split('.')).length - 1];

    return valid_extensions.includes(image_extension);
  }

  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();