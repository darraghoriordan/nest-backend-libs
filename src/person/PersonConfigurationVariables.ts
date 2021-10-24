import {registerAs} from "@nestjs/config";

export default registerAs("person", () => ({
    fakeSub: process.env.AUTH0_M2M_FAKE_SUB,
    fakeFamilyName: process.env.AUTH0_M2M_FAKE_FAMILY_NAME,
    fakeGivenNAme: process.env.AUTH0_M2M_FAKE_GIVEN_NAME,
    fakeName: process.env.AUTH0_M2M_FAKE_NAME,
    fakeEmail: process.env.AUTH0_M2M_FAKE_EMAIL,
    fakePicture: process.env.AUTH0_M2M_FAKE_PICTURE,
}));
