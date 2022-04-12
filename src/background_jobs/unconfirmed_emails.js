/**
 * @module Remove User Accounts With Unconfirmed Email Addresses
 * 
 * @description This async functions will search to find all the users on our database where confirmed_email is set to false,
 * it will retreive thier ids, then it deletes all the related data to that user before destroying the user itself.
 * 
 * @todo
 * Optimize.
 * 
 */




module.exports.remove_unconfirmed_email_users = async () => {


    // find and retreive all the users with an unconfirmed email address
    // this query only retreives the ids, for perfomance reasons

    const found_users = await User.findAll(
        {
            where:
            {
                confirmed_email: false,
            },
            attributes: ['id', 'createdAt'],
            raw: true,
        },
    )
  
    if (found_users != undefined && found_users.length) {

        // at this stage found_users will look like [ { id: 1, createdAt: '2022-03-26 22:23:43.002 +00:00' } ]
        // we want to turn it into an ids array which will look like [1], if the createdAt refers to a date before a month ago
        const ids = [];
        found_users.forEach((element) => {
            if (Date.parse(element.createdAt) < (Date.now() - 30 * 24 * 60 * 60 * 1000)) {
                ids.push(element.id);
            }
        })


        //remove all the data that belongs to a user with an unconfirmed email address
        await Promise.allSettled([
            Events.findAll(
                {
                    where:
                    {
                        ownerId: { [Op.in]: ids },
                    },
                },
            )
            ,
            User.destroy(
                {
                    where:
                    {
                        id: { [Op.in]: ids },
                    },
                },
            )
        ])

    }


}