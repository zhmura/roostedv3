exports.planFinder = (planName, paymentPeriod, planState, env) => {
    if(env === 'master') {
        if(planState === 'AZ') {
            if(planName === 'nest' && paymentPeriod === 'monthly') {
                return 'plan_F2qmQoTUPZsrV3'
            }
            if(planName === 'nest' && paymentPeriod === 'annual') {
                return 'plan_F2qmQoTUPZsrV3'
            }
            if(planName === 'perch' && paymentPeriod === 'monthly') {
                return 'plan_F2qlwNR038pMbf'
            }
            if(planName === 'perch' && paymentPeriod === 'annual') {
                return 'plan_F2qk8lfHlQkpzR'
            }
            if(planName === 'flight' && paymentPeriod === 'monthly') {
                return 'plan_F2qkbYolGAyCqo'
            }
            if(planName === 'flight' && paymentPeriod === 'annual') {
                return 'plan_F2qiZnls91uUce'
            }
            // if(planName === 'nest' && paymentPeriod === 'monthly') {
            //     return 'plan_EtklP47lbVm3xc'
            // }
            // if(planName === 'nest' && paymentPeriod === 'annual') {
            //     return 'plan_EtklP47lbVm3xc'
            // }
            // if(planName === 'perch' && paymentPeriod === 'monthly') {
            //     return 'plan_EtkmOpygwJVzYt'
            // }
            // if(planName === 'perch' && paymentPeriod === 'annual') {
            //     return 'plan_EtknVBsxr776Mg'
            // }
            // if(planName === 'flight' && paymentPeriod === 'monthly') {
            //     return 'plan_EtkpTfdToS9YBh'
            // }
            // if(planName === 'flight' && paymentPeriod === 'annual') {
            //     return 'plan_EtkpXuopujeCCv'
            // }
        }
    }
    if(env === 'staging') {
        if(planState === 'AZ') {
            if(planName === 'nest' && paymentPeriod === 'monthly') {
                return 'plan_EtklP47lbVm3xc'
            }
            if(planName === 'nest' && paymentPeriod === 'annual') {
                return 'plan_EtklP47lbVm3xc'
            }
            if(planName === 'perch' && paymentPeriod === 'monthly') {
                return 'plan_EtkmOpygwJVzYt'
            }
            if(planName === 'perch' && paymentPeriod === 'annual') {
                return 'plan_EtknVBsxr776Mg'
            }
            if(planName === 'flight' && paymentPeriod === 'monthly') {
                return 'plan_EtkpTfdToS9YBh'
            }
            if(planName === 'flight' && paymentPeriod === 'annual') {
                return 'plan_EtkpXuopujeCCv'
            }
        }
    }
    
}