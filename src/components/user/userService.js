import { prisma, cloudinary } from '../../config/config.js';

async function fetchAccountByID(account_id) {
    try {
        const account = await prisma.account.findUnique({
            where : {id : Number(account_id)},
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                avatar:true,
                birthdate: true,
                sex: true,
                create_time: true
            }
        })
        if (account && account.birthdate) {
            // Format birthdate to "yyyy-MM-dd"
            const birthdate = new Date(account.birthdate);
            account.birthdate = birthdate.toISOString().split('T')[0];
        }

        return account;
    } catch (error) {
        console.error('Error fetching accounts:', error);
        return {success:false, message: "Failed to fetch account"};
    }
}

async function updateProfileInfoByID(account_id, info) {
    const { name, address, birthdate, sex, phone } = info;
    let formattedBirthdate;
    if (birthdate) {
        // Convert the birthdate string to a Date object
        formattedBirthdate = new Date(`${birthdate}T00:00:00Z`);
    }
    // Check if at least one field is provided
    if (!name && !address && !birthdate && !sex && !phone) {
        return { success: false, message: "At least one field is required to update account" };
    }

    try {
        // Update the account with the provided fields
        const updatedAccount = await prisma.account.update({
            where: { id: Number(account_id) },
            data: {
                name: name || undefined,
                address: address || undefined,
                birthdate: formattedBirthdate || undefined,
                sex: sex || undefined,
                phone: phone || undefined // Adding phone to update
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                birthdate: true,
                sex: true,
                create_time: true
            }
        });

        return { success: true, message: 'Profile updated successfully', result: updatedAccount };
    } catch (error) {
        console.error('Error updating profile:', error);
        throw new Error(error.message || 'Failed to update profile');
    }
}


export async function updateAvatarByID(account_id, image) {
    // Fetch account information to get the current avatar's public ID
    const account = await prisma.account.findUnique({
        where: {
            id: Number(account_id),
        },
        select: {
            id: true,
            avatar: true, // Assuming 'avatar' stores the public_id
        },
    });

    if (!account) {
        return { success: false, message: 'Account does not exist' };
    }

    try {
        // Upload the new avatar to Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream({ folder: 'TechKit/avatar' }, (error, result) => {
                    if (error) reject(error);
                    resolve(result);
                })
                .end(image.buffer); // Use the buffer from the uploaded image
        });

        // Delete the old avatar from Cloudinary if it exists and isn't the default avatar
        if (account.avatar && account.avatar !== 'TechKit/avatar/default') {
            await cloudinary.uploader.destroy(account.avatar);
        }

        // Update the avatar's public_id in the database
        await prisma.account.update({
            where: {
                id: Number(account_id),
            },
            data: {
                avatar: result.public_id,
            },
        });

        // Return the URL of the updated avatar
        return {
            success: true,
            message: 'Avatar updated successfully',
            avatar_url: result.secure_url,
        };
    } catch (error) {
        console.error('Error updating avatar:', error);
        return {
            success: false,
            message: 'Failed to update avatar',
        };
    }
}

export {
    fetchAccountByID,
    updateProfileInfoByID,
};