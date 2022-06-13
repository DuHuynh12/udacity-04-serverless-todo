import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

// TODO: Implement the fileStogare logic
export class AttachmentUtils {
    constructor(
        private bucket = process.env.ATTACHMENT_S3_BUCKET
    ) { }

    async getS3Url(imageId: string): Promise<string> {
        return `https://${this.bucket}.s3.amazonaws.com/${imageId}`
    }

    async getS3SignedUrl(imageId: string): Promise<string> {
        let url = s3.getSignedUrl('putObject', {
            Bucket: this.bucket,
            Key: imageId,
            Expires: parseInt(process.env.SIGNED_URL_EXPIRATION)
        })
        return url
    }
}