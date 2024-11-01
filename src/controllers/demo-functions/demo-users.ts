export const populateDemoUsers = (usersList:any[]) => {
    // Populate with demo data
    usersList.push({
        id: usersList.length + 1,
        user_name: 'first_User',
        first_name: 'Scott',
        family_name: 'Summers',
        is_active: true,
    });

    usersList.push({
        id: usersList.length + 1,
        user_name: 'second_User',
        first_name: 'Robert',
        family_name: 'Drake',
        is_active: true,
    });

    usersList.push({
        id: usersList.length + 1,
        user_name: 'third_User',
        first_name: 'Henry',
        family_name: 'McCoy',
        is_active: true,
    });

    usersList.push({
        id: usersList.length + 1,
        user_name: 'fourth_User',
        first_name: 'Warren',
        family_name: 'Worthington',
        is_active: true,
    });

    usersList.push({
        id: usersList.length + 1,
        user_name: 'fifth_User',
        first_name: 'Jean',
        family_name: 'Grey',
        is_active: true,
    });
};