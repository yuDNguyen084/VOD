import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 20,
    duration: '1m',
};

export default function () {
    const url = 'http://host.docker.internal:4000/api/v1/test-flood';

    const payload = JSON.stringify({
        fileKey: 'sample_heavy_video.mp4',
        targetResolutions: ['720p', '1080p']
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const res = http.post(url, payload, params);

    check(res, {
        'job queued successfully': (r) => r.status === 200 || r.status === 201,
    });
    sleep(1);
}