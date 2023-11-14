import { useReducer, useState, useEffect } from "react";
import { Auth, Hub, API, graphqlOperation } from "aws-amplify";
import { getUser } from "../graphql/queries";
import { createUser } from "../graphql/mutations";

const amplifyAuthReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_USER_DATA_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case "FETCH_USER_DATA_SUCCESS":
      createNewUser(action.payload.user)

      return {
        ...state,
        isLoading: false,
        isError: false,
        user: action.payload.user
      };
    case "FETCH_USER_DATA_FAILURE":
      return { ...state, isLoading: false, isError: true };
    case "RESET_USER_DATA":
      return { ...state, user: null };
    default:
      throw new Error();
  }
};

const createNewUser = async signInData => {
  // use the below if you want to get is email verified or is phone verified
  // const attributesArr = await Auth.userAttributes(signInData);
  // const attributesObj = Auth.attributesToObject(attributesArr);
  // console.log(attributesObj)
  const getUserInput = {
    id: signInData.signInUserSession.idToken.payload.sub
  };
  try {
    console.log('Pulling User Data')
    console.log(signInData.signInUserSession.idToken.payload.sub)
    const { data } = await API.graphql(graphqlOperation(getUser, getUserInput));
    console.log(data)
    // if we can't get a user (meaning the user hasn't been registered before), then we execute registerUser
    if (data.getUser === null) {
      console.log('creating new user')
      try {
        const createNewUserInput = {
          ...getUserInput,
          email: signInData.signInUserSession.idToken.payload.email,
          phone: signInData.signInUserSession.idToken.payload.phone_number,
        };
        const newUser = await API.graphql(
          graphqlOperation(createUser, { input: createNewUserInput })
        );
        console.log({ newUser });
      } catch (err) {
        console.log(err)
        console.error("Error registering new user", err);
      }
    }
  } catch(error) {
    console.log(error)
  }
};

const useAmplifyAuth = () => {
  const initialState = {
    isLoading: true,
    isError: false,
    user: null
  };
  const [state, dispatch] = useReducer(amplifyAuthReducer, initialState);
  const [triggerFetch, setTriggerFetch] = useState(false);
  
  useEffect(() => {

    let isMounted = true;
    const fetchUserData = async () => {
      if (isMounted) {
        dispatch({ type: "FETCH_USER_DATA_INIT" });
      }
      try {
        if (isMounted) {
          const data = await Auth.currentAuthenticatedUser();
          if (data) {
            dispatch({
              type: "FETCH_USER_DATA_SUCCESS",
              payload: { user: data }
            });
          }
        }
      } catch (error) {
        if (isMounted) {
          dispatch({ type: "FETCH_USER_DATA_FAILURE" });
        }
      }
    };

    const HubListener = () => {
      Hub.listen("auth", data => {
        const { payload } = data;
        onAuthEvent(payload);
      });
    };

    const onAuthEvent = payload => {
      switch (payload.event) {
        case "signIn":
          if (isMounted) {
            setTriggerFetch(true);
            console.log("signed in");
          }
          break;
        default:
          return;
      }
    };

    HubListener();
    fetchUserData();

    return () => {
      Hub.remove("auth");
      isMounted = false;
    };

  }, [triggerFetch]);
  
  const handleSignOut = async () => {
    try {
      console.log("signed out");
      await Auth.signOut();
      setTriggerFetch(false);
      dispatch({ type: "RESET_USER_DATA" });
    } catch (error) {
      console.error("Error signing out user ", error);
    }
  };
  return { state, handleSignOut };
};

export default useAmplifyAuth;